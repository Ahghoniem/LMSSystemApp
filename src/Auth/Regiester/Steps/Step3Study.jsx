import React from "react";
import styles from "../RegisterForm.module.css";
import {  getLang } from "../../../Utils";

export default function Step3Study({
  t,
  errors,
  studyType,
  TrainingType,
  handleTypeChange,
  formValues,
  handleInputChange
})
 {
  const lang=getLang()
  const formatProductOptionLabel = (item) => {
    const isEgyptian = formValues.nationality === "Egyptian | مصري";
    const isArabic = lang === "ar";
    const courseName = isArabic
      ? item.courseNameAr
      : item.courseNameEn;
    if (isEgyptian) {
      const currency = isArabic ? "جنيه مصري" : "EGP";
      return `${courseName} (${item.priceEgyptian} ${currency})`;
    }
    const currencyCode = item.currency?.code ?? "$";
    return `${courseName} (${item.priceOther} ${currencyCode})`;
  };


  return (
    <div className={styles.formStep}>
     <div>
     <select name="type" className="rounded-md" required value={studyType} onChange={handleTypeChange}>
        <option value="" disabled>
          {t("study.study_level")}
        </option>
        <option value="4">{t("study.diploma")}</option>
        <option value="2">{t("study.masters")}</option>
        <option value="3">{t("study.PHD")}</option>
        <option value="1">{t("study.Teachers")}</option>
      </select>
      {errors.type && <span className={styles.error}>{errors.type}</span>}
     </div>

      <div>
      <select name="ProductId" className="rounded-md" value={formValues.ProductId} onChange={handleInputChange} required>
        <option value="" disabled>
          {t("study.training_course")}
        </option>
        {TrainingType.map((item) => (
          <option key={item.productId} value={item.productId}>
             {formatProductOptionLabel(item)}
          </option>
        ))}
      </select>
      {errors.training_type && <span className={styles.error}>{errors.training_type}</span>}
      </div>

     <div>
     <select name="StudyLan" className="rounded-md" onChange={handleInputChange} value={formValues.StudyLan} required>
        <option value="" disabled>
          {t("study.study_language")}
        </option>
        <option value="EN">{t("study.english")}</option>
        <option value="AR">{t("study.arabic")}</option>
      </select>
      {errors.StudyLan && <span className={styles.error}>{errors.StudyLan}</span>}
     </div>

      <div>
      <input
      value={formValues.department}
      onChange={handleInputChange}
        type="text"
        className="rounded-md"
        name="department"
        placeholder={t("study.department")}
        required
      />
      {errors.department && <span className={styles.error}>{errors.department}</span>}
      </div>
    </div>
  );
}
