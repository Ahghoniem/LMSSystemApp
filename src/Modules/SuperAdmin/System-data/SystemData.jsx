import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SystemData.module.css";
import { arabicRegex } from "../../../Auth/Regiester/validators";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../Constants";
import axiosInstance from "../../../Constants/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import SystemDataSkeleton from "./SystemDataSkeleton";

export default function SystemData() {
  const { t } = useTranslation("SystemData");
  const [loading, setIsLoading] = useState(false);

  const { data,isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/system/system-data`,
    queryKey: ["systemData"],
  });
  // Form state
  const [formData, setFormData] = useState({
    nameOfPersonInefada1: "",
    nameOfPersonInefada2: "",
    titlePersonInefada1: "",
    titlePersonInefada2: "",
    numberOfAttemptsAvailableToReexam: "",
  });

  const [errors, setErrors] = useState({});
  const hasErrors = (errors) => Object.values(errors).some(Boolean);

  // **Populate formData when API data arrives**
  useEffect(() => {
    if (data?.data?.data) {
      
      const d = data.data.data;
      setFormData({
        nameOfPersonInefada1: d[0]?.nameOfPersonInefada1 ?? "",
        nameOfPersonInefada2: d[0]?.nameOfPersonInefada2 ?? "",
        titlePersonInefada1: d[0]?.titlePersonInefada1 ?? "",
        titlePersonInefada2: d[0]?.titlePersonInefada2 ?? "",
        numberOfAttemptsAvailableToReexam: d[0]?.numberOfAttemptsAvailableToReexam ?? "",
      });
    }
  }, [data]);

  const validateField = (name, value) => {
    const isEmpty = !value || /^\s+$/.test(value);
    let error = "";

    if (name === "numberOfAttemptsAvailableToReexam") {
      if (isEmpty) error = t("errors.required");
      else if (!Number.isFinite(Number(value)) || Number(value) <= 0)
        error = t("errors.invalidNumber");
      return error;
    }

    if (isEmpty) return t("errors.required");
    if(name !== "numberOfAttemptsAvailableToReexam" && !arabicRegex.test(value))
    {
      return t("errors.arabic_only")
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const newErrors = {};
    Object.entries(formData).forEach(([name, value]) => {
      newErrors[name] = validateField(name, value);
    });
    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      return;
    }
    try {
      setIsLoading(true)
      await axiosInstance.put(`admin/system/system-data/${data?.data?.data[0]?.systemDataId}`,formData)
      toast.success(t("sucess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 3000,
      });
    } catch (error) {
      console.log(error);
      toast.error(t("error"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 3000,
      });
    }finally{
      setIsLoading(false)
    }
  };

  if(isLoading || !data?.data?.data){
    return ( <SystemDataSkeleton/>)
  }

  return (
    <div className={styles.systemDataPage}>
      <div className={styles.systemBox}>
        <div className={styles.systemHeader}>
          <h1>{t("title")}</h1>
        </div>

        <form className={styles.formGrid} onSubmit={handleSubmit}>
          {/** First Signer */}
          <div className={styles.formGroup}>
            <label>{t("fields.firstSignerName")}</label>
            <input
              type="text"
              name="nameOfPersonInefada1"
              value={formData.nameOfPersonInefada1}
              onChange={handleChange}
            />
            {errors.nameOfPersonInefada1 && (
              <span className={styles.error}>{errors.nameOfPersonInefada1}</span>
            )}
          </div>

          {/** Second Signer */}
          <div className={styles.formGroup}>
            <label>{t("fields.secondSignerName")}</label>
            <input
              type="text"
              name="nameOfPersonInefada2"
              value={formData.nameOfPersonInefada2}
              onChange={handleChange}
            />
            {errors.nameOfPersonInefada2 && (
              <span className={styles.error}>{errors.nameOfPersonInefada2}</span>
            )}
          </div>

          {/** First Job */}
          <div className={styles.formGroup}>
            <label>{t("fields.firstSignerJob")}</label>
            <input
              type="text"
              name="titlePersonInefada1"
              value={formData.titlePersonInefada1}
              onChange={handleChange}
            />
            {errors.titlePersonInefada1 && (
              <span className={styles.error}>{errors.titlePersonInefada1}</span>
            )}
          </div>

          {/** Second Job */}
          <div className={styles.formGroup}>
            <label>{t("fields.secondSignerJob")}</label>
            <input
              type="text"
              name="titlePersonInefada2"
              value={formData.titlePersonInefada2}
              onChange={handleChange}
            />
            {errors.titlePersonInefada2 && (
              <span className={styles.error}>{errors.titlePersonInefada2}</span>
            )}
          </div>

          {/** Allowed Attempts */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>{t("fields.allowedExamAttempts")}</label>
            <input
              type="number"
              min="0"
              name="numberOfAttemptsAvailableToReexam"
              value={formData.numberOfAttemptsAvailableToReexam}
              onChange={handleChange}
            />
            {errors.numberOfAttemptsAvailableToReexam && (
              <span className={styles.error}>
                {errors.numberOfAttemptsAvailableToReexam}
              </span>
            )}
          </div>

          <button type="submit" className={styles.btn} disabled={loading || hasErrors(errors)}>
            {loading ? (
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              t("buttons.update")
            )}
          </button>
        </form>
      </div>
      <Toaster/>
    </div>
  );
}