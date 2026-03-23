import React from "react";
import styles from "../RegisterForm.module.css";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../Constants";
import { getLang, splitLang } from "../../../Utils";
import  Select  from 'react-select';
import { smallSelectStyles } from "../../../Constants/SelectGlobalStyles";

export default function Step1Personal({
  t,
  formValues,
  errors,
  handleInputChange,
})

{
  const lang=getLang()
   const {data:nations}=useFetchData({
      baseUrl:`${API_BASE_URL}nationality`,
      queryKey:["nations"]
    })
    const options = (nations?.data?.data || []).map((item) => ({
        value: item.Name,
        label: lang === "ar" ? splitLang(item.Name).ar : splitLang(item.Name).en,
      }));
      const defaultOption = options.find(
        (opt) => opt.value === formValues.nationality
      ) || null;
  return (
    <div className={styles.formStep}>
      <div >
        <input
        className="rounded-md"
          type="text"
          name="name_ar"
          placeholder={t("personal.full_name_ar")}
          value={formValues.name_ar}
          onChange={handleInputChange}
          required
        />
        {errors.name_ar && <span className={styles.error}>{errors.name_ar}</span>}
      </div>

      <div>
        <input
        className="rounded-md"
          type="text"
          name="name_En"
          placeholder={t("personal.full_name_en")}
          value={formValues.name_En}
          onChange={handleInputChange}
          required
        />
        {errors.name_En && <span className={styles.error}>{errors.name_En}</span>}
      </div>
      <div>
      <Select
      styles={smallSelectStyles}
      placeholder={t("selectNationality")}
      options={options}
      value={defaultOption}
      onChange={(selectedOption) =>
        handleInputChange({
          target: { name: "nationality", value: selectedOption.value },
        })
      }
      />
      {errors.nationality && (
        <span className={styles.error}>{errors.nationality}</span>
      )}
      </div>
      <div>
        <input
        className="rounded-md"
          type="text"
          name="national_id"
          placeholder={
            formValues.nationality === "Egyptian | مصري"
              ? t("personal.id_number_egypt")
              : t("personal.id_number_foreign")
          }
          value={formValues.national_id}
          onChange={handleInputChange}
          required
        />
        {errors.national_id && (
          <span className={styles.error}>{errors.national_id}</span>
        )}
      </div>
      <div>
        <label className={styles.fieldLabel}>
          {!formValues.nationality || formValues.nationality === ""
            ? "صورة البطاقة أو جواز السفر"
            : formValues.nationality === "Egyptian | مصري"
            ? "وجه البطاقه"
            : "صورة جواز السفر"}
        </label>
        <input
          type="file"
          name="nationalIdImage"
          placeholder="Test"
          accept="image/*"
          className="rounded-md"
          aria-label={t("personal.id_image")}
          onChange={handleInputChange}
          required
        />
        {formValues.nationalIdImage && (
        <span style={{ marginLeft: "10px" ,fontSize:"15px",color:"#6B7280"}}>
        {formValues.nationalIdImage.name}
        </span>
    )}
        {errors.nationalIdImage && (
          <span className={styles.error}>{errors.nationalIdImage}</span>
        )}
      </div>

      {formValues.nationality === "Egyptian | مصري" && (
        <div>
          <label className={styles.fieldLabel}>ضهر البطاقه</label>
          <input
            type="file"
            name="id_image_back"
            className="rounded-md"
            accept="image/*"
            aria-label={t("personal.id_image_back")}
            onChange={handleInputChange}
            required
          />
           {formValues.id_image_back && (
        <span style={{ marginLeft: "10px" ,fontSize:"15px",color:"#6B7280"}}>
        {formValues.id_image_back.name}
        </span>
    )}
          {errors.id_image_back  &&(
            <span className={styles.error}>{errors.id_image_back}</span>
          )}
        </div>
      )}
    </div>
  );
}
