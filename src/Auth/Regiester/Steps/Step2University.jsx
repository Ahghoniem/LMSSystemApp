import styles from "../RegisterForm.module.css";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../Constants";
import { concatLang, getLang } from "../../../Utils";
import  Select  from 'react-select';
import { smallSelectStyles } from "../../../Constants/SelectGlobalStyles";
import { useState } from "react";

export default function Step2University({
  t,
  formValues,
  errors,
  handleInputChanges,
  sendDataToParent
}) {
  const lang = getLang();
  const [disbaled,setDisbaled]=useState(!formValues.university)
  const { data } = useFetchData({
    baseUrl: `${API_BASE_URL}universities`,
    queryKey: ["Universities"],
    params:{limit:100}
  });
  const { data:collages } = useFetchData({
    baseUrl: `${API_BASE_URL}colleges`,
    queryKey: ["coll"],
    params:{limit:100}
  });

  const bringCollages=(selected) => {
    setDisbaled(false)
    if(selected === "Alexandria National University | جامعة الإسكندرية الأهلية" || selected ===
       "Pharos University in Alexandria | جامعة فاروس بالإسكندرية" || selected === "Alexandria University | جامعة الإسكندرية")
    {
      sendDataToParent(true)
    }
  }

   const unis = (data?.data?.data || []).map((item) => ({
          value: concatLang(item.NameEn,item.NameAr),
          label: lang === "ar" ? item.NameAr : item.NameEn,
        }));
        
        const defaultUniOption = unis.find(
          (opt) => opt.value === formValues.university
        ) || null;

   const colls = (collages?.data?.data || []).map((item) => ({
          value: concatLang(item.nameEn,item.nameAr),
          label: lang === "ar" ? item.nameAr : item.nameEn,
        }));


        const defaultCollOption = colls.find(
          (opt) => opt.value === formValues.faculty
        ) || null;


  return (
    <div className={styles.formStep}>
      {/* ===== University Select ===== */}
      <div>
      <Select 
        placeholder={t("selectUni")}
        options={unis}
        value={defaultUniOption}
        styles={smallSelectStyles}
        onChange={(selectedOption) =>
        {
          bringCollages(selectedOption.value)
          handleInputChanges({
            target: { name: "university", value: selectedOption.value },
          })
        }
        }
      />
        {errors.university ? (
          <span className={styles.error}>{errors.university}</span>
        ) : null}
      </div>

      {/* ===== Other University Input ===== */}
      {/* {uni === "other" && (
        <div>
          <input
            type="text"
            name="university"
            value={formValues.university || ""}
            onChange={handleInputChanges}
            placeholder={t("university.other_placeholder")}
            required
          />
          {errors.university && uni === "other" ? (
            <span className={styles.error}>{errors.university}</span>
          ) : null}
        </div>
      )} */}

      {/* ===== Faculty Select ===== */}
      <div>
        <Select
        placeholder={t("selectColl")}
        options={colls}
        value={defaultCollOption}
        styles={smallSelectStyles}
        isDisabled={disbaled}
        onChange={(selected)=>
          handleInputChanges({
            target: { name: "faculty", value: selected.value },
          })
        }
        />
      
        {errors.faculty && <span className={styles.error}>{errors.faculty}</span>}
      </div>
    </div>
  );
}
