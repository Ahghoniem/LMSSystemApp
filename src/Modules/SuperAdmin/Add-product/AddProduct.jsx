import React, { useState } from "react";
import styles from "./AddProduct.module.css";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";
import Select, { components as SelectComponents } from "react-select";
import { reactSelectGlobalStyles } from "../../../Constants/SelectGlobalStyles";
import { allowedUserOptions } from "../Manage-products/dummyData";
import { arabicRegex, englishRegex } from "../../../Auth/Regiester/validators";
import axiosInstance from "../../../Constants/axiosInstance";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../Constants";
import { getLang, getToken, splitLang } from "../../../Utils";

const OptionWithCheckbox = (props) => (
  <SelectComponents.Option {...props}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        direction: "rtl",
      }}
    >
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        style={{
          cursor: "pointer",
          width: "18px",
          height: "18px",
          accentColor: "#163a63",
        }}
      />
      <label style={{ cursor: "pointer", margin: 0, fontSize: "15px" }}>
        {props.label}
      </label>
    </div>
  </SelectComponents.Option>
);

export default function AddProduct() {
  const { t } = useTranslation("AddProduct");
  const token = getToken();
  const lang = getLang();
  const { data: currenciesData } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/currencyManagement`,
    queryKey: ["currencies"],
    token,
  });
  const { data} = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/Receipts`,
    queryKey: ["receipts"],
    token,
});

  const currencies = currenciesData?.data?.currencies ?? [];
  const receiptsList = data?.data?.data ?? data?.data ?? [];
  const [productData, setProductData] = useState({
    courseNameEn: "",
    courseNameAr: "",
    allowedUserTypes: [],
    requirdCourses: "",
    priceEgyptian: "",
    priceOther: "",
    currencyId: "",
    receiptId: "",
    receiptIdOthers: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const hasErrors = (errors) => Object.values(errors).some((error) => error);

  const validateField = (name, value) => {
    let error = "";
    if (name === "currencyId") return ""; // optional
    if (!value || (typeof value === "string" && /^\s+$/.test(value))) {
      error = t("errors.required");
    } else if (
      name === "requirdCourses" ||
      name === "priceEgyptian" ||
      name === "priceOther"
    ) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        error = t("errors.invalidNumber");
      }
    } else if (
      name === "allowedUserTypes" &&
      (!Array.isArray(value) || value.length === 0)
    ) {
      error = t("errors.required");
    }

    if (name === "courseNameEn" && !englishRegex.test(value))
      error = t("errors.english_only");
    if (name === "courseNameAr" && !arabicRegex.test(value))
      error = t("errors.arabic_only");

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberOfCoursesChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const error = validateField("requirdCourses", value);
    setErrors((prev) => ({ ...prev, requirdCourses: error }));
    setProductData((prev) => ({
      ...prev,
      requirdCourses: value,
    }));
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.courseNameEn = validateField(
      "courseNameEn",
      productData.courseNameEn
    );
    newErrors.courseNameAr = validateField(
      "courseNameAr",
      productData.courseNameAr
    );
    newErrors.allowedUserTypes = validateField(
      "allowedUserTypes",
      productData.allowedUserTypes
    );
    newErrors.requirdCourses = validateField(
      "requirdCourses",
      productData.requirdCourses
    );
    newErrors.priceEgyptian = validateField(
      "priceEgyptian",
      productData.priceEgyptian
    );
    newErrors.priceOther = validateField("priceOther", productData.priceOther);
    return newErrors;
  };

  const userTypeMap = {
    1: "Teachers",
    2: "masters",
    3: "PHD",
    4: "diploma",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).some((key) => newErrors[key])) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post(`products`, productData);
      console.log(res);
      toast.success(t("success.productAdded"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });

      setLoading(false);
      setProductData({
        courseNameEn: "",
        courseNameAr: "",
        allowedUserTypes: [],
        requirdCourses: "",
        priceEgyptian: "",
        priceOther: "",
        currencyId: "",
        receiptId: "",
        receiptIdOthers: "",
      });
      setErrors({});
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(t("errors.submitFailed"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
  };

  return (
    <div className={styles.addProductPage}>
      <div className={styles.productBox}>
        <div className={styles.productHeader}>
          <h1>{t("title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>{t("fields.englishName")}</label>
            <input
              type="text"
              name="courseNameEn"
              value={productData.courseNameEn}
              onChange={handleChange}
            />
            {errors.courseNameEn && (
              <span className={styles.error}>{errors.courseNameEn}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{t("fields.arabicName")}</label>
            <input
              type="text"
              name="courseNameAr"
              value={productData.courseNameAr}
              onChange={handleChange}
            />
            {errors.courseNameAr && (
              <span className={styles.error}>{errors.courseNameAr}</span>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidthRow}`}>
            <label>{t("fields.allowedUsers")}</label>
            <Select
              isMulti
              components={{ Option: OptionWithCheckbox }}
              options={allowedUserOptions.map((option) => ({
                value: option,
                label: t(userTypeMap[option]),
              }))}
              value={
                productData.allowedUserTypes?.map((user) => ({
                  value: user,
                  label: t(userTypeMap[user]),
                })) || []
              }
              onChange={(selectedOptions) => {
                const selectedUsers = selectedOptions
                  ? selectedOptions.map((opt) => opt.value)
                  : [];
                const error = validateField("allowedUserTypes", selectedUsers);
                setErrors((prev) => ({ ...prev, allowedUserTypes: error }));
                setProductData((prev) => ({
                  ...prev,
                  allowedUserTypes: selectedUsers,
                }));
              }}
              placeholder={t("options.select")}
              styles={reactSelectGlobalStyles}
              className={styles.multiSelect}
              classNamePrefix="react-select"
              hideSelectedOptions={false}
            />
            {errors.allowedUserTypes && (
              <span className={styles.error}>{errors.allowedUserTypes}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{t("fields.numberOfCourses")}</label>
            <input
              type="text"
              name="requirdCourses"
              value={productData.requirdCourses}
              onChange={handleNumberOfCoursesChange}
              min="1"
              placeholder={t("fields.numberOfCoursesPlaceholder")}
            />
            {errors.requirdCourses && (
              <span className={styles.error}>{errors.requirdCourses}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{t("fields.pricingForEgyptians")}</label>
            <input
              type="text"
              name="priceEgyptian"
              value={productData.priceEgyptian}
              onChange={handlePricingChange}
              min="1"
              placeholder={t("fields.pricingForEgyptiansPlaceholder")}
            />
            {errors.priceEgyptian && (
              <span className={styles.error}>{errors.priceEgyptian}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{t("fields.pricingForForeigners")}</label>
            <input
              type="text"
              name="priceOther"
              value={productData.priceOther}
              onChange={handlePricingChange}
              min="1"
              placeholder={t("fields.pricingForForeignersPlaceholder")}
            />
            {errors.priceOther && (
              <span className={styles.error}>{errors.priceOther}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{t("fields.currency")}</label>
            <select
              name="currencyId"
              value={productData.currencyId}
              onChange={handleChange}
            >
              <option value="">{t("options.selectCurrency")}</option>
              {currencies.map((c) => (
                <option key={c.id ?? c.currencyId} value={c.currencyId}>
                  {lang === "ar" ? splitLang(c.name).ar : splitLang(c.name).en}
                </option>
              ))}
            </select>
            {errors.currencyId && (
              <span className={styles.error}>{errors.currencyId}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{t("fields.receiptEgyptians")}</label>
            <select
              name="receiptId"
              value={productData.receiptId}
              onChange={handleChange}
            >
              <option value="">{t("options.selectReceipt")}</option>
              {receiptsList.map((r) => (
                <option key={r.id ?? r.receiptId} value={r.id ?? r.receiptId}>
                  {r.receiptName ?? (lang === "ar" ? splitLang(r.name).ar : splitLang(r.name).en)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>{t("fields.receiptForeigners")}</label>
            <select
              name="receiptIdOthers"
              value={productData.receiptIdOthers}
              onChange={handleChange}
            >
              <option value="">{t("options.selectReceipt")}</option>
              {receiptsList.map((r) => (
                <option key={r.id ?? r.receiptId} value={r.id ?? r.receiptId}>
                  {r.receiptName ?? (lang === "ar" ? splitLang(r.name).ar : splitLang(r.name).en)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={hasErrors(errors) || loading}
            className={styles.btn}
          >
            {!loading ? (
              <>
                <i className="fa-solid fa-check"></i> {t("buttons.accept")}
              </>
            ) : (
              <div className={styles.load}>
                <span>{t("buttons.loading")}</span>
                <ClipLoader size={18} color="#fff" />
              </div>
            )}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
