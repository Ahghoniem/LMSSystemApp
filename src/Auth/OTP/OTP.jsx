import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./OTP.module.css";
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../../Constants";
import { getAuth, getStatus, setStatus } from "../../Utils";
import { ClipLoader } from "react-spinners";

export default function OTP() {
  const navigate= useNavigate();
  const status=getStatus()
  const { t } = useTranslation("otp");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [time, setTime] = useState(120);
  const [expired, setExpired] = useState(false);
  const [loading , setLoading]=useState(false)
  useEffect(() => {
    if (time <= 0) {
      setExpired(true);
      return;
    }

    const countdown = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [time]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const formatTime = (time) => {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const verifyOTP=async() => {
    if(otp[5] === '')
    {
      toast.error("برجاء ادخال الرقم السرى كامل",{
        position:"top-center",
        style:{backgroundColor:'red', color:'white'},
        duration:4000
      })
    }
    else{
     try {
      setLoading(true)
      const result=otp.join("")
      const res=await axios.post(`${API_BASE_URL}verify-otp`,{
        email:getAuth(),
        otp:result
      })
      toast.success(res.data.data,{
        position:"top-center",
        style:{backgroundColor:'green', color:'white'},
        duration:1500
      })
      setTimeout(() => {
        if(status === "Reset-Password")
        {
          navigate("/reset-password")
        }
        else{
          setStatus("verified-password")
          navigate("/Regiester")
        }
      }, 1500);
      setOtp(new Array(6).fill(""))
     } catch (error) {
      setLoading(false)
      toast.error(error.response.data.message,{
        position:"top-center",
        style:{backgroundColor:'red', color:'white'},
        duration:4000
      })
     }
    }
  }
  const Cancel=() => {
    setOtp(new Array(6).fill(""))
  }
  
  return (
    <main className={styles.page}>
      <div className={styles.otpBox}>
        {/* Icon */}
        <div className={styles.icon}>
          <img src="/561127.png" alt="lock" />
        </div>

        {/* Title & Subtitle */}
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>

        {/* OTP Inputs */}
        <div className={styles.otpInputs}>
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
            />
          ))}
        </div>

        {/* Resend & Timer */}
        <div className={styles.resend}>
          {!expired ? (
            <p id="timer" className={styles.timer}>
              {formatTime(time)}
            </p>
          ) : (
            <span>
              <span className={styles.grey}>{t("noCode")}</span>{" "}
              <a href="#" className={styles.blue}>
                {t("resend")}
              </a>
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className={styles.buttons}>
          <button className={styles.cancel} onClick={Cancel}>{t("cancel")}</button>
          <button className={styles.verify} disabled={loading} onClick={verifyOTP}>{!loading?t("verify"): <>
               <div className={styles.load}>
               <span>{t("loading")}</span>
               <ClipLoader size={18} color="#fff" />
               </div>
              </>}</button>
        </div>
      </div>
      <Toaster/>
    </main>
  );
}
