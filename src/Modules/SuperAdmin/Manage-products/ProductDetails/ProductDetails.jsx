import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ProductDetails.module.css";
import { getToken, getLang, normalize, splitLang, Decode_Token } from "../../../../Utils";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { allowedUserOptions } from "../dummyData";
import { API_BASE_URL } from "../../../../Constants";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import axiosInstance from "./../../../../Constants/axiosInstance";
import {
  arabicRegex,
  englishRegex,
} from "../../../../Auth/Regiester/validators";
import Popup from "../../../../Components/Popup/Popup";
import PageDetailsSkeleton from "../../../../Components/PageSkeleton/PageDetailsSkeleton";

export default function ProductDetails() {
  const { t } = useTranslation("ProductDetails");
  const { id } = useParams();
  const navigate = useNavigate();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
  const token = getToken();
  const lang = getLang();

  const { data: currenciesData , isLoading:isLoadingCurrency } = useFetchData({
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
  const [editedProduct, setEditedProduct] = useState(null);
  const [product, setProduct] = useState([]);
  const [errors, setErrors] = useState({});
  const hasErrors = (errors) => Object.values(errors).some((error) => error);
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    message: "",
    hasButtons: true,
  });

  const { data,refetch,isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}products/${id}`,
    queryKey: ["product"],
    token,
  });

  
  useEffect(() => {
    if (data?.data) {
      setProduct(data.data);
    }
  }, [data]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedProduct({ ...product });
    }
  };

  const userTypeMap = {
    1: "Teachers",
    2: "masters",
    3: "PHD",
    4: "diploma",
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
    setEditedProduct({
      ...editedProduct,
      [name]: value,
    });
  };
  console.log(editedProduct);
  

  const handleCurrencyChange = (e) => {
    const value = e.target.value;
    setEditedProduct({
      ...editedProduct,
      currencyId: value || undefined,
    });
  };

  const handleAllowedUsersChange = (option) => {
    const currentUsers = editedProduct.allowedUserTypes || [];

    const exists = currentUsers.some((u) => u.userType === option);

    const updatedUsers = exists
      ? currentUsers.filter((u) => u.userType !== option)
      : [...currentUsers, { userType: option }];

    setEditedProduct({
      ...editedProduct,
      allowedUserTypes: updatedUsers,
    });
  };

  const handleNumberOfCoursesChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setEditedProduct({
      ...editedProduct,
      requirdCourses: value,
    });
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: value === "" ? "" : parseFloat(value) || 0,
    });
  };

  const handleReceiptChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: value || undefined,
    });
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const formData = {
        ...editedProduct,
        allowedUserTypes: normalize(editedProduct.allowedUserTypes),
      };
      const res = await axiosInstance.put(`products/${id}`, formData);
      console.log(res.data);

      setProduct({ ...editedProduct });
      toast.success(t("updateSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      await refetch()
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
      const res = await axiosInstance.delete(`products/${id}`);
      console.log(res.data);
      toast.success(t("deleteSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setLoading(false);
      navigate(`/${role}/manage-products`);
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

  if(!data || isLoading || isLoadingCurrency || isloadingReceipts)
  {
    return <PageDetailsSkeleton rows={4} sections={2} />;
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <h2>{t("productNotFound")}</h2>
        <button onClick={() => navigate(`/${role}/manage-products`)}>
          {t("backToList")}
        </button>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("productDetails")}</h1>
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
                  value={editedProduct.courseNameEn}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
                {errors.courseNameEn && (
                  <span className={styles.error}>{errors.courseNameEn}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{product.courseNameEn}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("arabicName")}:</span>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="courseNameAr"
                  value={editedProduct.courseNameAr}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
                {errors.courseNameAr && (
                  <span className={styles.error}>{errors.courseNameAr}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{product.courseNameAr}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("allowedUsers")}:</span>
            {isEditing ? (
              <div className={styles.checkboxGroup}>
                {allowedUserOptions.map((option) => (
                  <label key={option} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={
                        editedProduct.allowedUserTypes?.some(
                          (u) => u.userType === option
                        ) || false
                      }
                      onChange={() => handleAllowedUsersChange(option)}
                      className={styles.checkbox}
                    />
                    <span>{t(userTypeMap[option])}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className={styles.allowedUsersContainer}>
                {product.allowedUserTypes &&
                product.allowedUserTypes.length > 0 ? (
                  product.allowedUserTypes.map((user, index) => (
                    <span key={index} className={styles.userBadge}>
                      {t(userTypeMap[user.userType]) || user}
                    </span>
                  ))
                ) : (
                  <span className={styles.value}>-</span>
                )}
              </div>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("numberOfCourses")}:</span>
            {isEditing ? (
              <input
                type="text"
                name="requirdCourses"
                value={editedProduct.requirdCourses}
                onChange={handleNumberOfCoursesChange}
                min="1"
                className={styles.editInput}
              />
            ) : (
              <span className={styles.value}>{product.requirdCourses}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("pricingForEgyptians")}:</span>
            {isEditing ? (
              <input
                type="text"
                name="priceEgyptian"
                value={editedProduct.priceEgyptian || ""}
                onChange={handlePricingChange}
                min="1"
                className={styles.editInput}
              />
            ) : (
              <span className={styles.value}>
                {product.priceEgyptian !== undefined &&
                product.priceEgyptian !== null &&
                product.priceEgyptian !== ""
                  ? `${parseFloat(product.priceEgyptian).toFixed(2)} EGP`
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
                value={editedProduct.priceOther || ""}
                onChange={handlePricingChange}
                min="1"
                className={styles.editInput}
              />
            ) : (
              <span className={styles.value}>
                {product.priceOther !== undefined &&
                product.priceOther !== null &&
                product.priceOther !== ""
                  ? `${parseFloat(product.priceOther).toFixed(2)} ${
                      product.currency?.code || "$"
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
                value={
                  editedProduct.currencyId ??
                  editedProduct.currency?.id ??
                  editedProduct.currency?.currencyId ??
                  ""
                }
                onChange={handleCurrencyChange}
                className={styles.editInput}
              >
                <option value="">
                  {t("selectCurrency") || "Select currency"}
                </option>
                {currencies.map((c) => (
                  <option key={c.id ?? c.currencyId} value={c.currencyId}>
                    {lang === "ar"
                      ? splitLang(c.name).ar
                      : splitLang(c.name).en}
                  </option>
                ))}
              </select>
            ) : (
              <span className={styles.value}>
                {product.currency
                  ? lang === "ar"
                    ? splitLang(product.currency.name || "").ar ||
                      product.currency.code
                    : product.currency.code || product.currency.name
                  : "-"}
              </span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("receiptEgyptians")}:</span>
            {isEditing ? (
              <select
                name="receiptId"
                value={editedProduct.receiptId ?? product.receiptId ?? ""}
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
                {product.receipt?.receiptName ??
                  receiptsList.find(
                    (r) => (r.id ?? r.receiptId) == (product.receiptid ?? product.receiptId)
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
                value={editedProduct.receiptIdOthers ?? product.receiptIdOthers ?? ""}
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
                {product.receiptOthers?.receiptName ??
                  receiptsList.find(
                    (r) => (r.id ?? r.receiptId) == (product.receiptidothers ?? product.receiptIdOthers)
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
                <button className={styles.editButton} onClick={handleEditClick}>
                  <i className="fa-solid fa-pen-to-square"></i> {t("edit")}
                </button>
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
              </>
            )}
          </div>

          <button
            className={styles.backIcon}
            onClick={() => navigate(`/${role}/manage-products`)}
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
