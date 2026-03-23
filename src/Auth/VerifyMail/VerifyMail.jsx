import styles from "./PutEmail.module.css";
import { ClipLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../Constants";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";
import { setAuth,setStatus } from "../../Utils";

export default function PutEmail() {
  const navigate=useNavigate()
  const [loading, setLoading] = useState(false);
  const [email,setEmail]=useState("")
  const [errors,setErrors]=useState({})
  const { t } = useTranslation("putEmail");
const hasErrors = (errors) => Object.values(errors).some((error) => error);

const validateField = (name, value) => {
  let error = "";

  if (name === "email") {
    if (!value || /^\s+$/.test(value)) {
      error = t("emailReq"); // e.g. "البريد الإلكتروني مطلوب"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = t("emailInvalid"); // e.g. "صيغة البريد الإلكتروني غير صحيحة"
    }
  }

  setErrors((prev) => ({ ...prev, [name]: error }));
};

  const handlChange=(e) => {
    const {value,name}=e.target
    validateField(name,value)
    setEmail(value)
  }
  const verifyEmail=async(email) => {
    try {
      const res=await axios.post(`${API_BASE_URL}verify-email`,{
        email:email
      })
      if(res.data) return false
    } catch (error) {
      console.log(error);
      return true
    }
  }

  const handleSubmit = async(e) => {
    let error=''
    e.preventDefault();
    if(email.length>1)
    {
     const found =await verifyEmail(email)
     console.log(found);
     
     if(found)
     {
      setLoading(true)
      const res=await axios.post(`${API_BASE_URL}send-otp`,{
        email:email
      })
      setEmail("")  
      toast.success(res.data.data,{
        position:"top-center",
        style:{backgroundColor:'green', color:'white'},
        duration:1500
      })
      setTimeout(() => {
        navigate("/otp")
      }, 1500);
      setAuth(email)
      setStatus("verify-email")
     }
     else{
      toast.error(t("verifyRes"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2500,
      });
      setLoading(false)
     }
    }
    else{
      toast.error(t("AllFieldsReq"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 1500,
      });
      setLoading(false)
       error=t("AllFieldsReq")
       setErrors({...errors,email:error})
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.auth}>
        <div className={styles.verificationHeader}>
          <h1>{t("title")}</h1>
          <p className={styles.verificationSubtitle}>{t("subtitle")}</p>
        </div>

        <div className={styles.emailBox}>
          <form id="emailForm" onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">{t("emailLabel")}</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handlChange}
                id="email"
                placeholder={t("emailPlaceholder")}
              />
              <div className={styles.error}>{errors.email}</div>
            </div>
            <button type="submit" disabled={hasErrors(errors) || loading}   className={styles.btn}>
              {!loading?t("sendCode"): <>
               <div className={styles.load}>
               <span>{t("loading")}</span>
               <ClipLoader size={18} color="#fff" />
               </div>
              </>}
            </button>
          </form>
        </div>
      </main>
      <Toaster/>
    </div>
  );
}
