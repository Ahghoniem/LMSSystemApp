import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./QRApproval.module.css";
import { Decode_Session_Token, Decode_Token, formatNowDateTime, getLang, getToken } from "../../Utils";
import { useFetchData } from "../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../Constants";
import axiosInstance from "../../Constants/axiosInstance";



export default function QRApproval() {
  const { t } = useTranslation("QRApproval");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const attendanceToken = searchParams.get("token");
  const data=Decode_Session_Token(attendanceToken)
  const navigate = useNavigate();
  const lang = getLang();
  const token=getToken()
  const userData=Decode_Token()

  useEffect(() => {
    const playSuccessSound = () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Create a pleasant success sound (two-tone chime)
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log("Audio playback error:", error);
      }
    };

    // Play sound after a short delay to ensure page is loaded
    const timer = setTimeout(() => {
      playSuccessSound();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    navigate("/");
  };

 const {data:session} =useFetchData({
  baseUrl:`${API_BASE_URL}admin/sessionManagement/${data.sessionId}`,
  queryKey:["sessionData"],
  token
 })


 useEffect(() => {
  if (!data?.sessionId || !token) return;

  const approveAttendance = async () => {
    try {
      const res = await axiosInstance.post(`Attendance/${data.sessionId}`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error) {
      console.error("Session approval failed:", error);
    }
  };

  approveAttendance()
}, [data?.sessionId, token]);


  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Success Icon */}
        <div className={styles.iconContainer}>
          <svg className={styles.successIcon} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            {/* Circle */}
            <circle
              className={styles.circle}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#28a745"
              strokeWidth="4"
            />
            {/* Checkmark */}
            <path
              className={styles.checkmark}
              d="M 30 50 L 45 65 L 70 35"
              fill="none"
              stroke="#28a745"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className={styles.title}>{t("title")}</h1>

        {/* Details Card */}
        <div className={styles.detailsCard}>
          <div className={styles.detailRow}>
            <div className={styles.detailItem}>
              <div className={styles.iconWrapper}>
                <i className="fa-solid fa-user"></i>
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>{t("student")}:</span>
                <span className={styles.detailValue}>{lang === 'ar' ? userData.name:userData.NameEn}</span>
              </div>
            </div>
            
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailItem}>
              <div className={styles.iconWrapper}>
                <i className="fa-solid fa-book"></i>
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>{t("course")}:</span>
                <span className={styles.detailValue}>{session?.data?.name}</span>
              </div>
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailItem}>
              <div className={styles.iconWrapper}>
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>{t("recordedAt")}:</span>
                <span className={styles.detailValue}>{formatNowDateTime(lang)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <p className={styles.message}>{t("successMessage")}</p>

        {/* Action Button */}
        <button className={styles.actionButton} onClick={handleBack}>
          {t("backButton")}
        </button>
      </div>
    </div>
  );
}

