import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./AddSession.module.css";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../../Constants/axiosInstance";
import { ClipLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import { addMinutes, concatLang } from "../../../../Utils";

export default function AddSession() {
  const { t } = useTranslation("AddSession");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trainingId = searchParams.get("trainingId");

  const [sessionData, setSessionData] = useState({
    sessionName: "",
    sessionNameEnglish:"",
    date: "",
    startTime: "",
    endTime: "",
    link: "",
    trainingId: trainingId || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const arabicRegex = /^[\u0600-\u06FF0-9\s]+$/;
  const englishRegex = /^[A-Za-z0-9\s]+$/;
  const validateField = (name, value) => {
    let error = "";
    const isEmpty = !value || /^\s+$/.test(value);
    if (isEmpty) error = t("errors.required");
    if (name === "sessionName") {
      if (!value.trim()) error = t("errors.requiredArabicName");
      else if (!arabicRegex.test(value.trim()))
        error = t("errors.arabicOnly");
    }
    if (name === "sessionNameEnglish") {
      if (!value.trim()) error = t("errors.requiredEnglishName");
      else if (!englishRegex.test(value.trim()))
        error = t("errors.englishOnly");
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };
  const hasErrors = (errors) =>
    Object.values(errors).some((error) => error);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    validateField(name, value);
    if (name === "sessionNumber" && value < 0) return;

    setSessionData((prev) => ({
      ...prev,
      [name]: type === "number" && value < 0 ? "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date();
    let newErrors = {};

    // Validate all fields
    for (const [key, value] of Object.entries(sessionData)) {
      if (!value || /^\s+$/.test(value)) {
        newErrors[key] = t("errors.required");
      }
    }

    // Validate date
    if (sessionData.date && new Date(sessionData.date) < new Date(today.setHours(0, 0, 0, 0))) {
      newErrors.date = t("errors.pastDate");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const formData = {
        name: concatLang(sessionData.sessionNameEnglish,sessionData.sessionName),
        date: sessionData.date,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        virtualLink: sessionData.link,
        trainingId: sessionData.trainingId || undefined,
      };
      await axiosInstance.post("admin/sessionManagement/", formData);
      toast.success(t("messages.sessionAdded"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });

      setLoading(false);
      setSessionData({
        sessionNumber: "",
        sessionName: "",
        date: "",
        startTime: "",
        endTime: "",
        link: "",
        trainingId: trainingId || "",
      });
    } catch (error) {
      console.log(error);
      
      setLoading(false);

      toast.error(t("messages.errorAdding"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
  };

  return (
    <div className={styles.addSessionPage}>
      <Toaster />
      <div className={styles.sessionBox}>
        {trainingId && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(`/trainer/all-sessions?trainingId=${trainingId}`)}
          >
            <i className="fa-solid fa-arrow-right"></i> {t("buttons.back")}
          </button>
        )}

        <div className={styles.sessionHeader}>
          <h1>
            {trainingId ? t("titles.addSessionForTraining") : t("titles.addNewSession")}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>

            {/* Session Name */}
            <div className={styles.formGroup}>
              <label>{t("fields.sessionName")}</label>
              <input
                type="text"
                name="sessionName"
                value={sessionData.sessionName}
                onChange={handleChange}
                placeholder={t("placeholders.sessionName")}
              />
              {errors.sessionName && <span className={styles.error}>{errors.sessionName}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>{t("fields.sessionNameEnglish")}</label>
              <input
                type="text"
                name="sessionNameEnglish"
                value={sessionData.sessionNameEnglish}
                onChange={handleChange}
                placeholder={t("placeholders.sessionNameEnglish")}
              />
              {errors.sessionNameEnglish && <span className={styles.error}>{errors.sessionNameEnglish}</span>}
            </div>
            {/* Date */}
            <div className={styles.formGroup}>
              <label>{t("fields.date")}</label>
              <input
                type="date"
                name="date"
                value={sessionData.date}
                onChange={handleChange}
                min={today}
              />
              {errors.date && <span className={styles.error}>{errors.date}</span>}
            </div>

            {/* Start Time */}
            <div className={styles.formGroup}>
              <label>{t("fields.startTime")}</label>
              <input
                type="time"
                name="startTime"
                value={sessionData.startTime}
                onChange={handleChange}
              />
              {errors.startTime && <span className={styles.error}>{errors.startTime}</span>}
            </div>

            {/* End Time */}
            <div className={styles.formGroup}>
              <label>{t("fields.endTime")}</label>
              <input
                type="time"
                name="endTime"
                min={addMinutes(sessionData.startTime,30)}
                value={sessionData.endTime}
                onChange={handleChange}
              />
              {errors.endTime && <span className={styles.error}>{errors.endTime}</span>}
            </div>
            {/* Link */}
            <div className={styles.formGroup}>
              <label>{t("fields.link")}</label>
              <input
                type="url"
                name="link"
                value={sessionData.link}
                onChange={handleChange}
                placeholder="https://example.com/session"
              />
              {errors.link && <span className={styles.error}>{errors.link}</span>}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading || hasErrors(errors)} className={styles.btn}>
              {!loading ? (
                <>
                  <i className="fa-solid fa-check"></i> {t("buttons.addSession")}
                </>
              ) : (
                <div className={styles.load}>
                  <span>{t("buttons.loading")}</span>
                  <ClipLoader size={18} color="#fff" />
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
