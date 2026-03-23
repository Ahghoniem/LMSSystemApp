import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./PackageDetails.module.css";
import { Decode_Token, getLang, getToken, splitLang } from "../../../../Utils";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import {
  arabicRegex,
  englishRegex,
} from "../../../../Auth/Regiester/validators";
import Popup from "../../../../Components/Popup/Popup";
import Select from "react-select";
import { reactSelectGlobalStyles } from "../../../../Constants/SelectGlobalStyles";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import axiosInstance from "../../../../Constants/axiosInstance";
import { API_BASE_URL } from "../../../../Constants";
import HasPermission from "../../../../Components/Permissions/HasPermission";
import PageDetailsSkeleton from "../../../../Components/PageSkeleton/PageDetailsSkeleton";

export default function PackageDetails() {
  const { t } = useTranslation("PackageDetails");
  const { id } = useParams();
  const navigate = useNavigate();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
  const token = getToken();
  const lang = getLang();

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [editedPackage, setEditedPackage] = useState(null);
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    message: "",
    hasButtons: true,
  });
  const hasErrors = (errors) => Object.values(errors).some((error) => error);

  const [courseOptions, setCourseOptions] = useState([]);
  const [availableTypeOptions, setAvailableTypeOptions] = useState([]);

  const { data ,isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/packagegManagement/${id}`,
    queryKey: ["packs", id],
    token,
  });

  const { data: products } = useFetchData({
    baseUrl: `${API_BASE_URL}products`,
    queryKey: ["products"],
  });

  const { data: courses } = useFetchData({
    baseUrl: `${API_BASE_URL}courses?limit=50`,
    queryKey: ["courses"],
    token,
  });


  useEffect(() => {
    if (!data?.data) return;

    const backendPackage = data.data;

    const nameParts = splitLang(backendPackage.packageName || "");
    const selectedCourseIds = new Set(
      backendPackage.courses?.map((c) => c.courseId) || []
    );

    const allCourses = (courses?.data?.data || []).map((course) => ({
      value: course.courseId,
      label: splitLang(course.name)[lang] || course.name,
    }));
    backendPackage.courses?.forEach((c) => {
      if (!selectedCourseIds.has(c.courseId)) {
        allCourses.push({
          value: c.courseId,
          label: splitLang(c.name)[lang] || c.name,
        });
      }
    });

    setCourseOptions(allCourses);
    const selectedProductIds = new Set(
      backendPackage.Products?.map((p) => p.productId) || []
    );

    const allProducts = (products?.data?.data || []).map((product) => ({
      value: product.productId,
      label: lang === "ar" ? product.courseNameAr : product.courseNameEn,
    }));

    backendPackage.Products?.forEach((p) => {
      if (!selectedProductIds.has(p.productId)) {
        allProducts.push({
          value: p.productId,
          label: splitLang(p.courseName)[lang] || p.courseName,
        });
      }
    });

    setAvailableTypeOptions(allProducts);

    setPackageData({
      packageId: backendPackage.packageId,
      packageNameEn: nameParts.en || "",
      packageNameAr: nameParts.ar || "",
      size: backendPackage.size,
      courseIds: backendPackage.courses?.map((c) => c.courseId) || [],
      productIds: backendPackage.Products?.map((p) => p.productId) || [],
    });
  }, [data, courses, products, lang]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedPackage({ ...packageData });
    }
  };

  

  const validateField = (name, value) => {
    let error = "";
    const isEmpty = !value || /^\s+$/.test(value);
    if (isEmpty) error = t("errors.required") || "This field is required";
    if (name === "packageNameEn" && value && !englishRegex.test(value))
      error = t("errors.english_only");
    if (name === "packageNameAr" && value && !arabicRegex.test(value))
      error = t("errors.arabic_only");
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
    setEditedPackage({ ...editedPackage, [name]: value });
  };

  const handleCountChange = (e) => {
    const newCount = Math.min(Math.max(Number(e.target.value), 1), 7);
    const currentItems = editedPackage.courseIds || [];
    const newItems = Array(newCount)
      .fill(null)
      .map((_, i) => currentItems[i] || null);
    setEditedPackage({ ...editedPackage, size: newCount, courseIds: newItems });
  };

  const handleCourseChange = (index, courseId) => {
    const newItems = [...(editedPackage.courseIds || [])];
    newItems[index] = courseId || null;
    setEditedPackage({ ...editedPackage, courseIds: newItems });
  };

  const getAvailableCourses = (currentIndex) => {
    const selectedIds = (editedPackage?.courseIds || []).filter(
      (id, i) => i !== currentIndex && id
    );
    return courseOptions.filter(
      (course) => !selectedIds.includes(course.value)
    );
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const payload = {
        packageName: `${editedPackage.packageNameEn} | ${editedPackage.packageNameAr}`,
        size: editedPackage.size,
        courseIds: editedPackage.courseIds,
        productIds: editedPackage.productIds,
      };
      await axiosInstance.put(`admin/packagegManagement/${id}`, payload);
      setPackageData({ ...editedPackage });
      setIsEditing(false);
      setLoading(false);
      toast.success(t("updateSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
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
      await axiosInstance.delete(`admin/packagegManagement/${id}`);
      toast.success(t("deleteSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setLoading(false);
      navigate(`/${role}/manage-packages`);
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

  

  const selectedTypes = availableTypeOptions.filter((opt) =>
    (isEditing ? editedPackage?.productIds : packageData?.productIds)?.includes(
      opt.value
    )
  );
  
   if (isLoading || !packageData) {
      return <PageDetailsSkeleton rows={8} sections={2} />;
    }
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("packageDetails")}</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.detailsGrid}>
          {/* English Name */}
          <div className={styles.detailRow}>
            <span className={styles.label}>{t("englishName")}:</span>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="packageNameEn"
                  value={editedPackage?.packageNameEn || ""}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
                {errors.packageNameEn && (
                  <span className={styles.error}>{errors.packageNameEn}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{packageData.packageNameEn}</span>
            )}
          </div>

          {/* Arabic Name */}
          <div className={styles.detailRow}>
            <span className={styles.label}>{t("arabicName")}:</span>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="packageNameAr"
                  value={editedPackage?.packageNameAr || ""}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
                {errors.packageNameAr && (
                  <span className={styles.error}>{errors.packageNameAr}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{packageData.packageNameAr}</span>
            )}
          </div>

          {/* Number of Elements */}
          <div className={styles.detailRow}>
            <span className={styles.label}>{t("numberOfElements")}:</span>
            {isEditing ? (
              <input
                type="number"
                min="1"
                max="7"
                value={editedPackage?.size || 1}
                onChange={handleCountChange}
                className={styles.editInput}
              />
            ) : (
              <span className={styles.value}>
                {packageData.size || packageData.courseIds?.length || 0}
              </span>
            )}
          </div>

          {/* Elements */}
          <div className={styles.detailRow} style={{ gridColumn: "1 / -1" }}>
            <span className={styles.label}>{t("elements")}:</span>
            {isEditing ? (
              <div className={styles.elementsEditContainer}>
                {Array.from({ length: editedPackage?.size || 1 }, (_, i) => {
                  const availableCourses = getAvailableCourses(i);
                  return (
                    <div key={i} className={styles.elementSelect}>
                      <label>
                        {t("item")} {i + 1}:
                      </label>
                      <select
                        value={editedPackage?.courseIds?.[i] || ""}
                        onChange={(e) => handleCourseChange(i, e.target.value)}
                        className={styles.editInput}
                      >
                        <option value="">{t("select")}</option>
                        {availableCourses.map((course) => (
                          <option key={course.value} value={course.value}>
                            {course.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.elementsContainer}>
                {packageData.courseIds.map((courseId, index) => {
                  const course = courseOptions.find(
                    (c) => c.value === courseId
                  );
                  return course ? (
                    <span key={index} className={styles.elementBadge}>
                      {course.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Available Types */}
          <div className={styles.detailRow} style={{ gridColumn: "1 / -1" }}>
            <span className={styles.label}>{t("availableType")}:</span>
            {isEditing ? (
              <div className={styles.selectContainer}>
                <Select
                  isMulti
                  options={availableTypeOptions}
                  placeholder={t("select")}
                  styles={reactSelectGlobalStyles}
                  value={selectedTypes}
                  onChange={(selected) => {
                    setEditedPackage({
                      ...editedPackage,
                      productIds: selected
                        ? selected.map((opt) => opt.value)
                        : [],
                    });
                  }}
                />
              </div>
            ) : (
              <div className={styles.elementsContainer}>
                {packageData.productIds.map((productId) => {
                  const type = availableTypeOptions.find(
                    (t) => t.value === productId
                  );
                  return type ? (
                    <span key={productId} className={styles.typeBadge}>
                      {type.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
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
                  disabled={loading}
                >
                  <i className="fa-solid fa-xmark"></i> {t("cancel")}
                </button>
              </>
            ) : (
              <>
                <HasPermission permission={"EDIT_PACKAGE"}>
                <button className={styles.editButton} onClick={handleEditClick}>
                  <i className="fa-solid fa-pen-to-square"></i> {t("edit")}
                </button>
                </HasPermission>
               <HasPermission permission={"DELETE_PACKAGE"}>
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
            onClick={() => navigate(`/${role}/manage-packages`)}
            title={t("backToList")}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>
      </div>

      <Toaster />
      <Popup
      isloading={loading}
        isOpen={popup.open}
        type={popup.type}
        message={popup.message}
        hasButtons={popup.hasButtons}
        to={"/"}
        warning={true}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
        action={handleDelete}
      />
    </div>
  );
}
