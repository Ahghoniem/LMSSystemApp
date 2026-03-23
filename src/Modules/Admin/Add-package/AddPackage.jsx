import React, { useState } from "react";
import styles from "./AddPackage.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { concatLang, extractValues, getLang, getToken, splitLang } from "../../../Utils";
import { API_BASE_URL } from "../../../Constants";
import { arabicRegex, englishRegex } from "../../../Auth/Regiester/validators";
import axiosInstance from "../../../Constants/axiosInstance";
import  Select from 'react-select';
import { reactSelectGlobalStyles} from "../../../Constants/SelectGlobalStyles";

export default function AddPackage() {
  const { t } = useTranslation("add_package");
  const lang = getLang();
  const token = getToken();
  const [loading,setIsloading]=useState(false)
  const { data } = useFetchData({ baseUrl: `${API_BASE_URL}courses?limit=50`, queryKey: ["courses"], token });

  const [formData, setFormData] = useState({
    packageName: "",
    packageNameen: "",
    count: 1,
    items: [""],
  });

  const [errors, setErrors] = useState({
    packageName: "",
    packageNameen: "",
    items: "",
    products:""
  });

  const {data:products}=useFetchData({
    baseUrl:`${API_BASE_URL}products`,
    queryKey:["products"]
  })
  const [selectedValues, setSelectedValues] = useState([]);
  const validateField = (field, value) => {
    const isEmpty = !value || /^\s+$/.test(value);
    switch (field) {
      case "packageName":
        return isEmpty ? t("add_package.validationError") : !arabicRegex.test(value) ? t("arabic_only") : "";
      case "packageNameen":
        return isEmpty ? t("add_package.validationError") : !englishRegex.test(value) ? t("english_only") : "";
      case "items":
        return value.map((item) => (!item ? t("add_package.emptyItemError") : ""));
      default:
        return "";
    }
  };
  const hasErrors = (errors) => {
    return Object.values(errors).some((error) => {
      if (Array.isArray(error)) {
        return error.some((e) => e !== "");
      }
      return error !== "";
    });
  };
  const handleChange = (field, value, index = null) => {
    if (field === "items") {
      const newItems = [...formData.items];
      newItems[index] = value;
      setFormData((prev) => ({ ...prev, items: newItems }));
      setErrors((prev) => ({ ...prev, items: validateField("items", newItems) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleCountChange = (e) => {
    const newCount = Math.min(Math.max(Number(e.target.value), 1), 7);
    const newItems = Array(newCount).fill("").map((_, i) => formData.items[i] || "");
    setFormData((prev) => ({ ...prev, count: newCount, items: newItems }));
    setErrors((prev) => ({ ...prev, items: validateField("items", newItems) }));
  };

  const getAvailableCourses = (currentIndex) => {
    if (!data?.data) return [];
    const selectedIds = formData.items.filter((_, i) => i !== currentIndex && formData.items[i] !== "");
    return data?.data?.data.filter((course) => !selectedIds.includes(course.courseId)) || [];
  };
  const handleSubmit = async(e) => {
    e.preventDefault();
    const nameError = validateField("packageName", formData.packageName);
    const nameenError = validateField("packageNameen", formData.packageNameen);
    const itemsError = validateField("items", formData.items);

    if ( nameError || nameenError || itemsError.some((err) => err !== "")) {
      setErrors({ packageName: nameError, packageNameen: nameenError, items: itemsError });
      toast.error(t("add_package.validationError"));
      return;
    }
    try {
      const packageData = {
        packageName: concatLang(formData.packageNameen, formData.packageName),
        size: formData.count,
        courseIds: formData.items,
        productIds:extractValues(selectedValues)
      };
      setIsloading(true)
      await axiosInstance.post("/admin/packagegManagement",packageData)
      toast.success(t("add_package.successMessage"));
      setFormData({ packageType: "", packageName: "", packageNameen: "", count: 1, items: [""] });
      setSelectedValues([])
    } catch (error) {
      console.log(error);
    }finally{
      setIsloading(false)
    }
  };
  console.log(errors);
  
  const options = products?.data?.data?.map(pro=>{
    return {value:pro.productId,label:lang === 'ar'?pro.courseNameAr:pro.courseNameEn}
  })
  return (
    <div className={styles.addPackagePage}>
      <div className={styles.packageBox}>
        <div className={styles.packageHeader}>
          <h1>{t("add_package.pageTitle")}</h1>
        </div>

        <form className={styles.formGrid} onSubmit={handleSubmit}>
          {/* Package Name */}
          <div className={styles.formGroup}>
            <label>{t("add_package.nameLabelArabic")}</label>
            <input
              type="text"
              placeholder={t("add_package.namePlaceholderArabic")}
              value={formData.packageName}
              onChange={(e) => handleChange("packageName", e.target.value)}
            />
            {errors.packageName && <p className={styles.error}>{errors.packageName}</p>}
          </div>
          <div className={styles.formGroup}>
            <label>{t("add_package.nameLabelEnglish")}</label>
            <input
              type="text"
              placeholder={t("add_package.namePlaceholderEnglish")}
              value={formData.packageNameen}
              onChange={(e) => handleChange("packageNameen", e.target.value)}
            />
            {errors.packageNameen && <p className={styles.error}>{errors.packageNameen}</p>}
          </div>

          {/* Count */}
          <div className={styles.formGroup}>
            <label>{t("add_package.countLabel")}</label>
            <input type="number" min="1" max="7" value={formData.count} onChange={handleCountChange} />
          </div>

          {/* Dynamic Select Boxes */}
          {
            Array.from({ length: formData.count }, (_, i) => (
              <div key={i} className={styles.formGroup}>
                <label>{t("item")+" "+(i+1)}</label>
                <select value={formData.items[i]} onChange={(e) => handleChange("items", e.target.value, i)}>
                  <option value="">{t("add_package.itemPlaceholder")}</option>
                  {getAvailableCourses(i).map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {lang !== "ar" ? splitLang(course.name).en : splitLang(course.name).ar || course.name}
                    </option>
                  ))}
                </select>
                {errors.items[i] && <p className={styles.error}>{errors.items[i]}</p>}
              </div>
            ))}
            <div className={styles.formGroup}>
              <label htmlFor="selectedValues">{t("type")}</label>
            <Select
            isMulti
            options={options}
            placeholder={t("select")}
            styles={reactSelectGlobalStyles}
            value={selectedValues}
            onChange={setSelectedValues}
            required
/>
            </div>

          {/* Submit */}
          <button type="submit" disabled={loading || hasErrors(errors)} className={styles.btn}>
            {loading ? 
            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />:
            <>
            <i className="fa-solid fa-plus"></i> {t("add_package.submitBtn")}
            </>
            }
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
