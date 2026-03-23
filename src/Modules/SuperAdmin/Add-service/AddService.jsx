import React, { useState } from "react";
import styles from "./AddService.module.css";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";
import { arabicRegex, englishRegex } from "../../../Auth/Regiester/validators";
import axiosInstance from "../../../Constants/axiosInstance";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../Constants";
import { concatLang, getLang, getToken, splitLang } from "../../../Utils";

export default function AddService() {
    const { t } = useTranslation("AddService");
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

    const [serviceData, setServiceData] = useState({
        courseNameEn: "",
        courseNameAr: "",
        priceEgyptian: "",
        priceOther: "",
        currencyId: "",
        receiptid: "",
        receiptidothers: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const hasErrors = (errors) => Object.values(errors).some((error) => error);

    const validateField = (name, value) => {
        let error = "";
        if (name === "currencyId") return "";
        if (!value || (typeof value === "string" && /^\s+$/.test(value))) {
            error = t("errors.required");
        } else if (name === "priceEgyptian" || name === "priceOther") {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) {
                error = t("errors.invalidNumber");
            }
        }
        if (name === "courseNameEn" && value && !englishRegex.test(value))
            error = t("errors.english_only");
        if (name === "courseNameAr" && value && !arabicRegex.test(value))
            error = t("errors.arabic_only");
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
        setServiceData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePricingChange = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
        setServiceData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        newErrors.courseNameEn = validateField(
            "courseNameEn",
            serviceData.courseNameEn
        );
        newErrors.courseNameAr = validateField(
            "courseNameAr",
            serviceData.courseNameAr
        );
        newErrors.priceEgyptian = validateField(
            "priceEgyptian",
            serviceData.priceEgyptian
        );
        newErrors.priceOther = validateField(
            "priceOther",
            serviceData.priceOther
        );
        return newErrors;
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
            await axiosInstance.post("services",{
                name:concatLang(serviceData.courseNameEn,serviceData.courseNameAr),
                priceEgyptian:serviceData.priceEgyptian,
                priceOther:serviceData.priceOther,
                currencyId:serviceData.currencyId,
                receiptId:serviceData.receiptid || undefined,
                receiptIdOthers:serviceData.receiptidothers || undefined,
            });
            toast.success(t("success.serviceAdded"), {
                position: "top-center",
                style: { backgroundColor: "green", color: "white" },
                duration: 3000,
            });
            setLoading(false);
            setServiceData({
                courseNameEn: "",
                courseNameAr: "",
                priceEgyptian: "",
                priceOther: "",
                currencyId: "",
                receiptid: "",
                receiptidothers: "",
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
        <div className={styles.addServicePage}>
            <div className={styles.serviceBox}>
                <div className={styles.serviceHeader}>
                    <h1>{t("title")}</h1>
                </div>

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>{t("fields.englishName")}</label>
                        <input
                            type="text"
                            name="courseNameEn"
                            value={serviceData.courseNameEn}
                            onChange={handleChange}
                        />
                        {errors.courseNameEn && (
                            <span className={styles.error}>
                                {errors.courseNameEn}
                            </span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("fields.arabicName")}</label>
                        <input
                            type="text"
                            name="courseNameAr"
                            value={serviceData.courseNameAr}
                            onChange={handleChange}
                        />
                        {errors.courseNameAr && (
                            <span className={styles.error}>
                                {errors.courseNameAr}
                            </span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("fields.pricingForEgyptians")}</label>
                        <input
                            type="text"
                            name="priceEgyptian"
                            value={serviceData.priceEgyptian}
                            onChange={handlePricingChange}
                            placeholder={t("fields.pricingForEgyptiansPlaceholder")}
                        />
                        {errors.priceEgyptian && (
                            <span className={styles.error}>
                                {errors.priceEgyptian}
                            </span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("fields.pricingForForeigners")}</label>
                        <input
                            type="text"
                            name="priceOther"
                            value={serviceData.priceOther}
                            onChange={handlePricingChange}
                            placeholder={t("fields.pricingForForeignersPlaceholder")}
                        />
                        {errors.priceOther && (
                            <span className={styles.error}>
                                {errors.priceOther}
                            </span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("fields.currency")}</label>
                        <select
                            name="currencyId"
                            value={serviceData.currencyId}
                            onChange={handleChange}
                        >
                            <option value="">
                                {t("options.selectCurrency")}
                            </option>
                            {currencies.map((c) => (
                                <option
                                    key={c.id ?? c.currencyId}
                                    value={c.currencyId}
                                >
                                    {lang === "ar"
                                        ? splitLang(c.name).ar
                                        : splitLang(c.name).en}
                                </option>
                            ))}
                        </select>
                        {errors.currencyId && (
                            <span className={styles.error}>
                                {errors.currencyId}
                            </span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("fields.receiptEgyptians")}</label>
                        <select
                            name="receiptid"
                            value={serviceData.receiptid}
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
                            name="receiptidothers"
                            value={serviceData.receiptidothers}
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
                                <i className="fa-solid fa-check"></i>{" "}
                                {t("buttons.accept")}
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
