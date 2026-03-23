import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import styles from "./CourseDetails.module.css";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";
import { concatLang, Decode_Token, getLang, splitLang } from "../../../../Utils";
import {
  englishRegex,
} from "../../../../Auth/Regiester/validators";
import { API_BASE_URL } from "../../../../Constants";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import axiosInstance from "../../../../Constants/axiosInstance";
import Popup from "../../../../Components/Popup/Popup";
import { getToken } from "../../../../Utils";
import HasPermission from "../../../../Components/Permissions/HasPermission";
import PageDetailsSkeleton from "../../../../Components/PageSkeleton/PageDetailsSkeleton";

export default function CourseDetails() {
  const { t } = useTranslation("CourseDetails");
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
  const currencies =
    currenciesData?.data?.currencies ??
    currenciesData?.data ??
    currenciesData ??
    [];

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editedCourse, setEditedCourse] = useState(null);
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    message: "",
    hasButtons: true,
  });

  const { data, refetch ,isLoading} = useFetchData({
    baseUrl: `${API_BASE_URL}courses/${id}`,
    queryKey: ["course", id],
    token,
  });

  const course = data?.data;

  useEffect(() => {
    if (course) {
      const currencyVal =
        course.currencyId ?? course.currency?.id ?? course.currency ?? "";
      setEditedCourse({
        courseName_en: splitLang(course?.name).en,
        courseName_ar: splitLang(course?.name).ar,
        title: course?.title ?? "",
        priceForEgypt: course?.priceEgyptian ?? "",
        priceForForigner: course?.priceOther ?? course?.priceForForeigner ?? "",
        currency: String(currencyVal || ""),
      });
    }
  }, [course]);

  const validateField = (name, value) => {
    let error = "";
    const isEmpty = !value || /^\s+$/.test(value);
    if (name === "priceForEgypt" || name === "priceForForigner") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        error = t("errors.invalidNumber");
      }
    }
    if (isEmpty) error = t("errors.required") || "هذا الحقل مطلوب";
    if (name === "courseName_en" && value && !englishRegex.test(value))
      error = t("errors.english_only");
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);

    if (name === "courseName_en" || name === "courseName_ar") {
      setEditedCourse((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setEditedCourse((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    if (
      !editedCourse?.courseName_en?.trim() &&
      !editedCourse?.courseName_ar?.trim()
    ) {
      newErrors.courseName_en = t("errors.required") || "هذا الحقل مطلوب";
    }
    if (!editedCourse?.title?.trim()) {
      newErrors.title = t("errors.required") || "هذا الحقل مطلوب";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: concatLang(
          editedCourse.courseName_en,
          editedCourse.courseName_ar
        ),
        title: editedCourse.title,
        priceEgyptian: editedCourse.priceForEgypt,
        priceOther: editedCourse.priceForForigner,
        currencyId: editedCourse.currency || undefined,
      };
      await axiosInstance.put(`courses/${id}`, data);
      toast.success(t("messages.courseUpdated") || "تم تحديث الكورس بنجاح", {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      await refetch();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
      toast.error(t("messages.updateError") || "حدث خطأ في التحديث", {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await axiosInstance.delete(`courses/${id}`);
      toast.success(t("messages.courseDeleted"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      navigate(`/${role}/manage-courses`);
    } catch (error) {
      console.log(error);
      toast.error(t("messages.DeleteError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
    setLoadingDelete(false);
  };

  const hasErrors = (errs) => Object.values(errs || {}).some((e) => e);

  if (!course && isLoading) {
   return <PageDetailsSkeleton rows={4} sections={2} />;
  }

  if (!course) {
    return (
      <div className={styles.container}>
        <h2>{t("courseNotFound") || "الكورس غير موجود"}</h2>
        <button onClick={() => navigate(`/${role}/manage-courses`)}>
          {t("backToList") || "العودة للقائمة"}
        </button>
      </div>
    );
  }
  console.log(editedCourse);

  const courseName = course.courseName || course.name || "";
  const split = splitLang(courseName);
  const courseName_en = split.en || editedCourse?.courseName_en || "";
  const courseName_ar = split.ar || editedCourse?.courseName_ar || "";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title") || "تفاصيل الكورس"}</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.detailsGrid}>
          <div className={styles.detailRow}>
            <span className={styles.label}>
              {t("fields.courseId") || "رقم الكورس:"}
            </span>
            <span className={styles.value}>
              {course.courseId || course.id || course.course_id || "-"}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>
              {t("fields.courseNameEn") || "اسم الكورس بالإنجليزية:"}
            </span>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="courseName_en"
                  value={editedCourse?.courseName_en ?? courseName_en}
                  onChange={handleChange}
                  className={styles.editInput}
                  placeholder={
                    t("placeholders.courseNameEn") ||
                    "Enter course name in English"
                  }
                />
                {errors.courseName_en && (
                  <span className={styles.error}>{errors.courseName_en}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{courseName_en || "-"}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>
              {t("fields.courseNameAr") || "اسم الكورس بالعربية:"}
            </span>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="courseName_ar"
                  value={editedCourse?.courseName_ar ?? courseName_ar}
                  onChange={handleChange}
                  className={styles.editInput}
                  placeholder={
                    t("placeholders.courseNameAr") || "أدخل اسم الكورس بالعربية"
                  }
                />
                {errors.courseName_ar && (
                  <span className={styles.error}>{errors.courseName_ar}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{courseName_ar || "-"}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>
              {t("fields.title") || "العنوان:"}
            </span>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="title"
                  value={editedCourse?.title ?? course.title ?? ""}
                  onChange={handleChange}
                  className={styles.editInput}
                  placeholder={t("placeholders.title") || "أدخل عنوان الكورس"}
                />
                {errors.title && (
                  <span className={styles.error}>{errors.title}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{course.title ?? "-"}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>
              {t("fields.priceForEgypt") || "السعر للمصريين:"}
            </span>
            {isEditing ? (
              <input
                type="text"
                name="priceForEgypt"
                value={
                  editedCourse?.priceForEgypt ?? course.priceForEgypt ?? ""
                }
                onChange={handleChange}
                className={styles.editInput}
                placeholder={
                  t("placeholders.priceForEgypt") || "أدخل السعر للمصريين"
                }
              />
            ) : (
              <span className={styles.value}>
                {course.priceEgyptian !== undefined &&
                course.priceEgyptian !== null &&
                course.priceEgyptian !== ""
                  ? `${parseFloat(course.priceEgyptian).toFixed(2)} EGP`
                  : "-"}
              </span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>
              {t("fields.priceForForigner") || "السعر للأجانب:"}
            </span>
            {isEditing ? (
              <input
                type="text"
                name="priceForForigner"
                value={
                  editedCourse?.priceForForigner ??
                  course.priceForForigner ??
                  course.priceForForeigner ??
                  ""
                }
                onChange={handleChange}
                className={styles.editInput}
                placeholder={
                  t("placeholders.priceForForigner") || "أدخل السعر للأجانب"
                }
              />
            ) : (
              <span className={styles.value}>
                {course.priceOther !== undefined &&
                course.priceOther !== null &&
                course.priceOther !== ""
                  ? `${parseFloat(course.priceOther).toFixed(2)} ${
                      course.currency?.code || "$"
                    }`
                  : "-"}
              </span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>
              {t("fields.currency") || "العملة:"}
            </span>
            {isEditing ? (
              <select
                name="currency"
                value={editedCourse?.currency ?? ""}
                onChange={handleChange}
                className={styles.editInput}
              >
                <option value="">
                  {t("options.selectCurrency") || "اختر العملة"}
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
                {course.currency
                  ? lang === "ar"
                    ? splitLang(course.currency.name || "").ar ||
                      course.currency.code
                    : course.currency.code || course.currency.name
                  : "-"}
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  className={styles.editButton}
                  onClick={handleSave}
                  disabled={loading || hasErrors(errors)}
                >
                  {!loading ? (
                    <>
                      <i className="fa-solid fa-check"></i>{" "}
                      {t("buttons.save") || "حفظ التغييرات"}
                    </>
                  ) : (
                    <div className={styles.load}>
                      <span>{t("buttons.saving") || "جاري الحفظ..."}</span>
                      <ClipLoader size={16} color="#fff" />
                    </div>
                  )}
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  <i className="fa-solid fa-xmark"></i>{" "}
                  {t("buttons.cancel") || "إلغاء"}
                </button>
              </>
            ) : (
              <>
               <HasPermission permission={"EDIT_COURSE"}>
               <button
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fa-solid fa-pen-to-square"></i>{" "}
                  {t("buttons.edit") || "تعديل"}
                </button>
               </HasPermission>
                <HasPermission permission={"DELETE_COURSE"}>
                <button
                  className={styles.deleteButton}
                  onClick={() =>
                    setPopup({
                      open: true,
                      type: "warning",
                      message:
                        t("messages.deleteConfirm") ||
                        "هل أنت متأكد من حذف هذا الكورس؟",
                      hasButtons: true,
                    })
                  }
                  disabled={loadingDelete}
                >
                  <i className="fa fa-times"></i>{" "}
                  {loadingDelete
                    ? t("buttons.deleting") || "جاري الحذف..."
                    : t("buttons.delete") || "حذف"}
                </button>
                </HasPermission>
              </>
            )}
          </div>

          <button
            className={styles.backIcon}
            onClick={() => navigate(`/${role}/manage-courses`)}
            title={t("backToList") || "العودة للقائمة"}
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
        warning={true}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
        action={handleDelete}
        isloading={loadingDelete}
      />
    </div>
  );
}
