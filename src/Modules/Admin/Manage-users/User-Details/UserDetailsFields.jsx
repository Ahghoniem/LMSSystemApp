import { concatLang, splitLang } from "../../../../Utils";
import { reactSelectGlobalStyles } from "../../../../Constants/SelectGlobalStyles";
import  Select  from 'react-select';
import axiosInstance from "../../../../Constants/axiosInstance";


export const renderUniversityField = (
  setShowInput,
  handleChange,
  setColleges,
  styles,
  data,
  isEditing,
  showInput,
  t,
  formData,
  colleges,
  lang,
  disbaled,
  setDisabled
) => {
  
  const handleUniversityChange = async (value) => {
    if (value === "Other") {
      setShowInput(true);
      handleChange("university", "");
      setColleges([]);
    } else {
      setShowInput(false);
      handleChange("university", value);

      try {
        const res = await axiosInstance.get(`colleges`, {
          params: { limit: 100 },
        });
        setColleges(res?.data.data.data || []);
        setDisabled(false)
      } catch (err) {
        console.error("Failed to fetch colleges:", err);
      }
    }
  };
  const handleCollegeChange = async(value) => {
    handleChange("college", value);
  };

  const getDisplayLabel = (item) =>
    lang === "ar" ? splitLang(item).ar : splitLang(item).en;

  return (
    <>
      {/* University Field */}
      <div className={styles.dataItem}>
        <div className={styles.dataLabel}>{t("fields.university")}</div>
        {isEditing ? (
          <div className={styles.selectWrap}>
            <Select
              styles={reactSelectGlobalStyles}
              classNamePrefix="select"
              placeholder={t("select_university")}
              options={[
                ...(data?.data?.data?.map((uni) => ({
                  value: concatLang(uni.NameEn, uni.NameAr),
                  label: lang === "ar" ? uni.NameAr : uni.NameEn,
                })) || []),
                { value: "Other", label: t("Other") },
              ]}
              value={
                showInput
                  ? { value: "Other", label: t("Other") }
                  : data?.data?.data?.find(
                      (uni) =>
                        concatLang(uni.NameEn, uni.NameAr) ===
                        formData.university
                    ) && {
                      value: formData.university,
                      label: getDisplayLabel(formData.university),
                    }
              }
              onChange={(selectedOption) =>
                handleUniversityChange(selectedOption?.value)
              }
            />
          </div>
        ) : (
          <div className={styles.dataValue}>
            {formData.university ? getDisplayLabel(formData.university) : "-"}
          </div>
        )}
      </div>

      {isEditing && showInput && (
        <div className={styles.dataItem}>
          <div className={styles.dataLabel}>{t("enterUniversity")}</div>
          <input
            type="text"
            className={styles.editInput}
            placeholder={t("enterUniversity")}
            value={formData.university}
            onChange={(e) => handleChange("university", e.target.value)}
          />
        </div>
      )}

      {/* College Field */}
      <div className={styles.dataItem}>
        <div className={styles.dataLabel}>{t("fields.college")}</div>
        {isEditing ? (
          <div className={styles.selectWrap}>
            <Select
              styles={reactSelectGlobalStyles}
              isDisabled={disbaled}
              classNamePrefix="select"
              placeholder={t("select_college")}
              options={colleges.map((col) => ({
                value: concatLang(col.nameEn, col.nameAr),
                label: lang === "ar" ? col.nameAr : col.nameEn,
              }))}
              value={
                formData.college
                  ? {
                      value: formData.college,
                      label: getDisplayLabel(formData.college),
                    }
                  : null
              }
              onChange={(selectedOption) =>
                handleCollegeChange(selectedOption?.value)
              }
            />
          </div>
        ) : (
          <div className={styles.dataValue}>
            {formData.college ? getDisplayLabel(formData.college) : "-"}
          </div>
        )}
      </div>
    </>
  );
};



export const renderNationalityField = (
  formData,
  styles,
  isEditing,
  handleChange,
  t,
  nationalities,
  lang,
) => {
  // Build options
  const options = (nationalities || []).map((item) => ({
    value: item.Name,
    label: lang === "ar" ? splitLang(item.Name).ar : splitLang(item.Name).en,
  }));

  // Find default option from options array
  const defaultOption = options.find(
    (opt) => opt.value === formData.nationality
  ) || null;

  return (
    <div className={styles.dataItem}>
       <div className={styles.dataLabel}>{t("fields.nationality")}</div>
      {isEditing ? (
        <Select
          styles={reactSelectGlobalStyles}
          options={options}
          value={defaultOption}
          onChange={(selected) => {
            handleChange("nationality", selected.value);
          }}
          placeholder={t("selectNationality")}
        />
      ) : (
        <div className={styles.dataValue}>
          {lang === "ar"
            ? splitLang(formData.nationality).ar
            : splitLang(formData.nationality).en}
        </div>
      )}
    </div>
  );
};

  export const renderField = (label, field, value,styles , isEditing,handleChange,t,errors) => (
    <div className={styles.dataItem}>
      <div className={styles.dataLabel}>{label}</div>
  
      {isEditing && field !== "preferredCourse" && field !== "level" ? (
        <div>
          {field === "StudyLan" ? (
            <select
              name={field}
              className={styles.editInput}
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
            >
              <option value="arabic">{t("arabic")}</option>
              <option value="english">{t("english")}</option>
            </select>
          ) : (
            <input
              type="text"
              name={field}
              disabled={field === "preferredCourse" || field === "level"}
              className={styles.editInput}
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          )}
          {errors[field] && <span className={styles.error}>{errors[field]}</span>}
        </div>
      ) : (
        <div className={styles.dataValue}>
           {field === "StudyLan" ? t(value) : value}
          </div>
      )}
    </div>
  );
