import React, { useState } from "react";
import styles from "./AddCourse.module.css";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../../Constants/axiosInstance";
import { ClipLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import { englishRegex } from "../../../../Auth/Regiester/validators";
import { concatLang, getLang, getToken, splitLang } from "../../../../Utils";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../../Constants";

export default function AddCourse() {
  const { t } = useTranslation("AddCourse");
  const token = getToken();
  const lang =getLang();
  const { data: currenciesData } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/currencyManagement`,
    queryKey: ["currencies"],
    token,
  });
  const currencies = currenciesData?.data?.currencies  ?? currenciesData?.data ?? currenciesData ?? [];

  const [courseData, setCourseData] = useState({
    courseName_en: "",
    courseName_ar: "",
    title: "",
    priceForEgypt: "",
    priceForForigner: "",
    currency: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
    const hasErrors = (errors) => Object.values(errors).some((error) => error);

  const validateField = (name, value) => {
    let error = "";
    const isEmpty = !value || /^\s+$/.test(value);
    if (
      name === "priceForEgypt" ||
      name === "priceForForigner"
    ) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        error = t("errors.invalidNumber");
      }
    }
    if (isEmpty) error = t("errors.required");
    if (name === "courseName_en" && value && !englishRegex.test(value)) error = t("errors.english_only");
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);

    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!courseData.courseName_en || /^\s+$/.test(courseData.courseName_en)) {
      newErrors.courseName_en = t("errors.required");
    }

    if (!courseData.courseName_ar || /^\s+$/.test(courseData.courseName_ar)) {
      newErrors.courseName_ar = t("errors.required");
    }
    if (!courseData.title || /^\s+$/.test(courseData.title)) {
      newErrors.title = t("errors.required");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const formData = {
        name: concatLang(courseData.courseName_en,courseData.courseName_ar),
        title: courseData.title,
        priceEgyptian: courseData.priceForEgypt,
        priceOther: courseData.priceForForigner,
        currencyId: courseData.currency,
      };
      await axiosInstance.post("courses/", formData);

      toast.success(t("messages.courseAdded"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });

      setLoading(false);
      setCourseData({
        courseName_en: "",
        courseName_ar: "",
        title: "",
        priceForEgypt: "",
        priceForForigner: "",
        currency: "",
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
    <div className={styles.addCoursePage}>
      <Toaster />
      <div className={styles.courseBox}>
        <div className={styles.courseHeader}>
          <h1>{t("titles.addNewCourse")}</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {/* Course Name English */}
            <div className={styles.formGroup}>
              <label>{t("fields.courseNameEn")}</label>
              <input
                type="text"
                name="courseName_en"
                value={courseData.courseName_en}
                onChange={handleChange}
                placeholder={t("placeholders.courseNameEn")}
              />
              {errors.courseName_en && <span className={styles.error}>{errors.courseName_en}</span>}
            </div>

            {/* Course Name Arabic */}
            <div className={styles.formGroup}>
              <label>{t("fields.courseNameAr")}</label>
              <input
                type="text"
                name="courseName_ar"
                value={courseData.courseName_ar}
                onChange={handleChange}
                placeholder={t("placeholders.courseNameAr")}
              />
              {errors.courseName_ar && <span className={styles.error}>{errors.courseName_ar}</span>}
            </div>

            {/* Title */}
            <div className={styles.formGroup}>
              <label>{t("fields.title")}</label>
              <input
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleChange}
                placeholder={t("placeholders.title")}
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>

            {/* Price for Egypt */}
            <div className={styles.formGroup}>
              <label>{t("fields.priceForEgypt")}</label>
              <input
                type="text"
                name="priceForEgypt"
                value={courseData.priceForEgypt}
                onChange={handleChange}
                placeholder={t("placeholders.priceForEgypt")}
              />
              {errors.priceForEgypt && <span className={styles.error}>{errors.priceForEgypt}</span>}
            </div>

            {/* Price for Foreigner */}
            <div className={styles.formGroup}>
              <label>{t("fields.priceForForigner")}</label>
              <input
                type="text"
                name="priceForForigner"
                value={courseData.priceForForigner}
                onChange={handleChange}
                placeholder={t("placeholders.priceForForigner")}
              />
              {errors.priceForForigner && <span className={styles.error}>{errors.priceForForigner}</span>}
            </div>

            {/* Currency */}
            <div className={styles.formGroup}>
              <label>{t("fields.currency")}</label>
              <select
                name="currency"
                value={courseData.currency}
                onChange={handleChange}
              >
                <option value="">{t("options.selectCurrency")}</option>
                {currencies.map((c) => (
                  <option key={c.id ?? c.currencyId} value={c.currencyId}>
                    {lang === "ar" ? splitLang(c.name).ar : splitLang(c.name).en}
                  </option>
                ))}
              </select>
              {errors.currency && <span className={styles.error}>{errors.currency}</span>}
            </div>

            <div className="col-span-full">
            <button type="submit" className={`${styles.btn} w-full`} disabled={loading || hasErrors(errors)}>
              {!loading ? (
                <>
                  <i className="fa-solid fa-check"></i> {t("buttons.addCourse")}
                </>
              ) : (
                <div className={styles.load}>
                  <span>{t("buttons.loading")}</span>
                  <ClipLoader size={18} color="#fff" />
                </div>
              )}
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

