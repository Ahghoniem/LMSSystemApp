import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ServiceDetails.module.css";
import { getToken, getLang, splitLang, concatLang, Decode_Token } from "../../../../Utils";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { API_BASE_URL } from "../../../../Constants";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import axiosInstance from "./../../../../Constants/axiosInstance";
import {
  arabicRegex,
  englishRegex,
} from "../../../../Auth/Regiester/validators";
import Popup from "../../../../Components/Popup/Popup";
import PageDetailsSkeleton from "../../../../Components/PageSkeleton/PageDetailsSkeleton";
import PageNotFound from "../../../../Components/PageDetailsNotFound/PageNotFound";
import HasPermission from "../../../../Components/Permissions/HasPermission";

export default function ServiceDetails() {
  const { t } = useTranslation("ServiceDetails");
  const { id } = useParams();
  const navigate = useNavigate();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
  const token = getToken();
  const lang = getLang();

  const { data: currenciesData } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/currencyManagement`,
    queryKey: ["currencies"],
    token,
  });
    const { data:receipts, isLoading:isloadingReceipts } = useFetchData({
      baseUrl: `${API_BASE_URL}SuperAdmin/Receipts`,
      queryKey: ["receipts"],
      token,
  });
  const currencies = currenciesData?.data?.currencies ?? [];
  const receiptsList = receipts?.data?.data ?? receipts?.data ?? [];
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedService, setEditedService] = useState(null);
  const [service, setService] = useState(null);
  const [errors, setErrors] = useState({});
  const hasErrors = (errors) => Object.values(errors).some((error) => error);
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    message: "",
    hasButtons: true,
  });

  const { data, refetch, isloading } = useFetchData({
    baseUrl: `${API_BASE_URL}services/${id}`,
    queryKey: ["service", id],
    token,
  });

  useEffect(() => {
    if (data?.data) {
      setService(data.data);
    }
  }, [data]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedService({ ...service });
    }
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "currencyId") return;
    const isEmpty = !value || /^\s+$/.test(value);
    if (isEmpty) error = t("errors.required") || "هذا الحقل مطلوب";
    if (name === "courseNameEn" && value && !englishRegex.test(value))
      error = t("errors.english_only");
    if (name === "courseNameAr" && value && !arabicRegex.test(value))
      error = t("errors.arabic_only");
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
    setEditedService({
      ...editedService,
      [name]: value,
    });
  };

  const handleCurrencyChange = (e) => {
    const value = e.target.value;
    setEditedService({
      ...editedService,
      currencyId: value || undefined,
    });
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setEditedService({
      ...editedService,
      [name]: value === "" ? "" : parseFloat(value) || 0,
    });
  };

  const handleReceiptChange = (e) => {
    const { name, value } = e.target;
    setEditedService({
      ...editedService,
      [name]: value || undefined,
    });
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const nameEn = editedService?.courseNameEn ?? serviceName.en;
        const nameAr = editedService?.courseNameAr ?? serviceName.ar;
        await axiosInstance.put(`services/${id}`, {
        name: concatLang(nameEn, nameAr),
        priceEgyptian: editedService.priceEgyptian,
        priceOther: editedService.priceOther,
        currencyId: editedService.currencyId,
        receiptId: editedService.receiptId || undefined,
        receiptIdOthers: editedService.receiptIdOthers || undefined,
      });
      setService({ ...editedService });
      toast.success(t("updateSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      await refetch();
      setLoading(false);
      setIsEditing(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(t("updateError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(`services/${id}`);
      toast.success(t("deleteSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setLoading(false);
      navigate(`/${role}/manage-services`);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(t("deleteError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
  };

  const notFound =
    data && (data.data === null || data.data === undefined) && !loading;
  if (notFound) {
    return (
      <PageNotFound
        title={t("eventNotFound")}
        message={t("eventNotFoundDescription")}
        buttonText={t("backToList")}
        onBack={() => navigate(`/${role}/manage-services`)}
      />
    );
  }
  if (isloading || !service || isloadingReceipts) {
    return <PageDetailsSkeleton rows={8} sections={2} />;
  }
  const parseName = (name) => {
    const parts = name?.split("|") ?? [];
    return {
      en: parts[0]?.trim() || "",
      ar: parts[1]?.trim() || "",
    };
  };

  const serviceName = parseName(service.name);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("serviceDetails")}</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.detailsGrid}>
          <div className={styles.detailRow}>
            <span className={styles.label}>{t("englishName")}:</span>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="courseNameEn"
                  value={editedService?.courseNameEn ?? serviceName.en}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
                {errors.courseNameEn && (
                  <span className={styles.error}>{errors.courseNameEn}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{serviceName.en}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("arabicName")}:</span>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="courseNameAr"
                  value={editedService?.courseNameAr ?? serviceName.ar}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
                {errors.courseNameAr && (
                  <span className={styles.error}>{errors.courseNameAr}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{serviceName.ar}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("pricingForEgyptians")}:</span>
            {isEditing ? (
              <input
                type="text"
                name="priceEgyptian"
                value={editedService?.priceEgyptian || ""}
                onChange={handlePricingChange}
                min="1"
                className={styles.editInput}
              />
            ) : (
              <span className={styles.value}>
                {service.priceEgyptian !== undefined &&
                service.priceEgyptian !== null &&
                service.priceEgyptian !== ""
                  ? `${parseFloat(service.priceEgyptian).toFixed(2)} EGP`
                  : "-"}
              </span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("pricingForForeigners")}:</span>
            {isEditing ? (
              <input
                type="text"
                name="priceOther"
                value={editedService?.priceOther || ""}
                onChange={handlePricingChange}
                min="1"
                className={styles.editInput}
              />
            ) : (
              <span className={styles.value}>
                {service.priceOther !== undefined &&
                service.priceOther !== null &&
                service.priceOther !== ""
                  ? `${parseFloat(service.priceOther).toFixed(2)} ${
                      service.currency || "$"
                    }`
                  : "-"}
              </span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("currency")}:</span>
            {isEditing ? (
              <select
                name="currencyId"
                value={editedService?.currencyId || ""}
                onChange={handleCurrencyChange}
                className={styles.editInput}
              >
                <option value="">{t("selectCurrency")}</option>
                {currencies.map((c) => (
                  <option key={c.currencyId} value={c.currencyId}>
                    {lang === "ar"
                      ? splitLang(c.name).ar
                      : splitLang(c.name).en}{" "}
                    ({c.code})
                  </option>
                ))}
              </select>
            ) : (
              <span className={styles.value}>{service.currency || "-"}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("receiptEgyptians")}:</span>
            {isEditing ? (
              <select
                name="receiptId"
                value={editedService?.receiptId ?? service.receiptId ?? ""}
                onChange={handleReceiptChange}
                className={styles.editInput}
              >
                <option value="">{t("selectReceipt")}</option>
                {receiptsList.map((r) => (
                  <option key={r.id ?? r.receiptId} value={r.id ?? r.receiptId}>
                    {r.receiptName ?? (lang === "ar" ? splitLang(r.name).ar : splitLang(r.name).en)}
                  </option>
                ))}
              </select>
            ) : (
              <span className={styles.value}>
                {service.receipt?.receiptName ??
                  receiptsList.find(
                    (r) => (r.id ?? r.receiptId) == (service.receiptid ?? service.receiptId)
                  )?.receiptName ??
                  "-"}
              </span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("receiptForeigners")}:</span>
            {isEditing ? (
              <select
                name="receiptIdOthers"
                value={editedService?.receiptIdOthers ?? service.receiptIdOthers ?? ""}
                onChange={handleReceiptChange}
                className={styles.editInput}
              >
                <option value="">{t("selectReceipt")}</option>
                {receiptsList.map((r) => (
                  <option key={r.id ?? r.receiptId} value={r.id ?? r.receiptId}>
                    {r.receiptName ?? (lang === "ar" ? splitLang(r.name).ar : splitLang(r.name).en)}
                  </option>
                ))}
              </select>
            ) : (
              <span className={styles.value}>
                {service.receiptOthers?.receiptName ??
                  receiptsList.find(
                    (r) => (r.id ?? r.receiptId) == (service.receiptidothers ?? service.receiptIdOthers)
                  )?.receiptName ??
                  "-"}
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  className={`${styles.editButton} disabled:cursor-not-allowed`}
                  onClick={handleSaveEdit}
                  disabled={loading || hasErrors(errors)}
                >
                  <i className="fa-solid fa-check"></i>{" "}
                  {loading ? t("saving") : t("saveChanges")}
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => setIsEditing(false)}
                  disabled={loading || hasErrors(errors)}
                >
                  <i className="fa-solid fa-xmark"></i> {t("cancel")}
                </button>
              </>
            ) : (
              <>
                <HasPermission permission={"EDIT_SERVICE"}>
                <button className={styles.editButton} onClick={handleEditClick}>
                  <i className="fa-solid fa-pen-to-square"></i> {t("edit")}
                </button>
                </HasPermission>
                <HasPermission permission={"DELETE_SERVICE"}>
                <button
                  className={styles.deleteButton}
                  onClick={() =>
                    setPopup({
                      open: true,
                      type: "warning",
                      message: t("popupMessage"),
                      hasButtons: true,
                    })
                  }
                  disabled={loading}
                >
                  <i className="fa fa-times"></i>{" "}
                  {loading ? t("deleting") : t("delete")}
                </button>
                </HasPermission>
              </>
            )}
          </div>

          <button
            className={styles.backIcon}
            onClick={() => navigate(`/${role}/manage-services`)}
            title={t("backToList")}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>
      </div>
      <Toaster />
      <Popup
        isOpen={popup.open}
        type={popup.type}
        message={popup.message}
        hasButtons={popup.hasButtons}
        to={"/"}
        warning={true}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
        action={handleDelete}
        isloading={loading}
      />
    </div>
  );
}
