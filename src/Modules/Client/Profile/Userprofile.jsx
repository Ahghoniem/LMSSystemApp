import React, { useState } from "react";
import styles from "./UserProfile.module.css";
import { useTranslation } from "react-i18next";
import ProfileSkeleton from "../../../Components/Skeleton/ProfileSkeleton";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { Decode_Token, getLang, getToken, splitLang } from "../../../Utils";
import { API_BASE_URL } from "../../../Constants";

export default function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const lang =getLang()
  const { t } = useTranslation("userProfile");
  const token=getToken()
  const tokenData=Decode_Token(token)

  const {data:user,isLoading}=useFetchData({
    baseUrl:`${API_BASE_URL}admin/usersManagment/student/${tokenData.id}`,
    queryKey:["dataa"],
    token
  })
   const keyMapping = {
    "1": "Teachers",
    "2": "masters",
    "3": "PHD",
    "4": "diploma",
  };

  const openPopup = () => {
    setIsOpen(true);
    document.body.classList.add("blurred");
  };

  const closePopup = () => {
    setIsOpen(false);
    document.body.classList.remove("blurred");
  };
  return (
   <>
   {isLoading || !user?.data? <ProfileSkeleton/> :
    <main className={styles.content}>
    <div className={styles.profileWrapper}>
      <div className={styles.profileCard}>
        <h2 className={styles.formTitle}>{t("Title")}</h2>
        <h3 className={styles.sectionTitle}>{t("personalInfo")}</h3>
        <div className={styles.profileGrid}>
          <div className={styles.field}>
            <label>{t("fullNameAr")}</label>
            <span>{user?.data?.fullName}</span>
          </div>
          <div className={styles.field}>
            <label>{t("fullNameEn")}</label>
            <span>{user?.data?.NameEn}</span>
          </div>
          <div className={styles.field}>
            <label>{t("nationality")}</label>
            <span>{lang === 'ar' ? splitLang(user?.data?.nationality).ar:splitLang(user?.data?.nationality).en}</span>
          </div>
          <div className={styles.field}>
            <label>{user?.data?.nationality !== "Egyptian | مصري" ? t("Passport"):t("nationalId")}</label>
            <span>{user?.data?.nationalId}</span>
          </div>
          <div className={styles.field}>
            <label>{t("mobile")}</label>
            <span>{user?.data?.Mobile}</span>
          </div>
          <div className={styles.field}>
            <label>{t("email")}</label>
            <span>{tokenData.email}</span>
          </div>
        </div>

        {/* 🟢 Registration Information */}
        <h3 className={styles.sectionTitle}>{t("registrationInfo")}</h3>
        <div className={styles.profileGrid}>
          <div className={styles.field}>
            <label>{t("university")}</label>
            <span>{lang === 'ar' ? splitLang(user?.data?.university).ar : splitLang(user?.data?.university).en}</span>
          </div>
          <div className={styles.field}>
            <label>{t("faculty")}</label>
            <span>{lang === 'ar' ? splitLang(user?.data?.college).ar:splitLang(user?.data?.college).en}</span>
          </div>
          <div className={styles.field}>
            <label>{t("stage")}</label>
            <span>{t(keyMapping[user?.data?.type])}</span>
          </div>
          <div className={styles.field}>
            <label>{t("coursePreference")}</label>
            <span>{lang === 'ar' ? splitLang(user?.data?.Product?.courseName).ar ?? user?.data?.Product?.courseName : splitLang(user?.data?.Product?.courseName).en ?? user?.data?.Product?.courseName}</span>
          </div>
          <div className={styles.field}>
            <label>{t("studyLanguage")}</label>
            <span>{t(user?.data?.StudyLan)}</span>
          </div>
          <div className={styles.field}>
            <label>{t("department")}</label>
            <span>{user?.data?.department}</span>
          </div>
        </div>
        <div className={styles.action}>
          <button className={styles.submitBtn} onClick={openPopup}>
          {t("openPopup")}
        </button>
        </div>
      </div>
    </div>
    {isOpen && (
      <div className={styles.qrPopup}>
        <div className={styles.qrBox}>
          <span className={styles.close} onClick={closePopup}>
            &times;
          </span>
          <img
            src={user?.data?.profilePhoto}
            alt="QR Code"
          />
        </div>
      </div>
    )}
  </main>}
   </>
  );
}
