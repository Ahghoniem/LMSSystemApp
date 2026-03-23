import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import styles from "./CourseEventDetails.module.css";
import { formatDateOnly, getLang, splitLang } from "../../../../Utils";

export default function CourseEventDetails({
  row: rowProp,
  type: typeProp,
  onClose,
  isModal = false,
}) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation("Courses_Table");
  const lang = getLang();

  const row = isModal && rowProp != null ? rowProp : state?.row;
  const type = isModal && typeProp != null ? typeProp : (state?.type || "training");

  const handleBack = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  useEffect(() => {
    if (!isModal) return;
  
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (onClose) onClose();
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
  
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModal, onClose]);

  if (!row) {
    if (isModal) return null;
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <p>{t("selectRowForDetails")}</p>
            <button className={styles.back} onClick={() => navigate(-1)}>
              {lang === "ar" ? "العودة للجدول" : "Back to table"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExam = type === "exam" || row?.type === "exam";

  const { ar: nameAr, en: nameEn } = splitLang(row.eventName ?? "");
  const localizedName = lang === "ar" ? (nameAr || nameEn || row.eventName) : (nameEn || nameAr || row.eventName);


  const cardContent = (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 id="event-details-title" className={styles.title}>{localizedName}</h1>
        <span className={styles.badge}>
          {isExam ? t("examBadge") : t("trainingSession")}
        </span>
      </div>

      {!isExam && (
        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{t("startOfCourse")}:</span>
            <span className={styles.metaValue}>
              {row.startDate ? formatDateOnly(row.startDate) : "—"}
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{t("endOfCourse")}:</span>
            <span className={styles.metaValue}>
              {row.endDate ? formatDateOnly(row.endDate) : "—"}
            </span>
          </div>
        </div>
      )}

      <div className={styles.courses}>
        <h2 className={styles.coursesTitle}>
          {isExam ? t("subExams") : t("eventCourses")}
        </h2>
        <div className={styles.courseList}>
          {isExam
            ? row?.exams?.map((sub) => (
              <div key={sub.examId} className={styles.courseRow}>
                <div className={styles.courseName}>
                  {lang === 'ar' ? splitLang(sub.course.name).ar ?? sub.course.name : splitLang(sub.course.name).en ?? sub.course.name}
                </div>
                 <div className={styles.courseMeta}>
                 <span>
                    {t("examDayLabel")}:{" "}
                    <strong>{formatDateOnly(sub.date)}</strong>
                  </span>
                 </div>
                <div className={styles.courseMeta}>
                  <span>
                    {t("superName")}:{" "}
                    <strong>{lang === 'ar' ? splitLang(sub.supervisor.Name).ar ?? sub.supervisor.Name : splitLang(sub.supervisor.Name).en ?? sub.supervisor.Name}</strong>
                  </span>
                </div>
              </div>
            ))
            : row?.trainings.map((course, index) => (
                <div key={`${course.title ?? "course"}-${index}`} className={styles.courseRow}>
                  <div className={styles.courseName}>{lang === 'ar'? splitLang(course.course?.name).ar ?? course.course?.name : splitLang(course.course?.name).en ?? course.course?.name  ?? ""}</div>
                  <div className={styles.courseMeta}>
                    {course.trainer != null && course.trainer !== "" && (
                      <span>
                        <strong>{lang === 'ar' ? splitLang(course.trainer.Name).ar ?? course.trainer.Name : splitLang(course.trainer.Name).en ?? course.trainer.Name}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </div>

      <div className={styles.backWrap}>
        <button className={styles.back} onClick={handleBack}>
          {lang === "ar" ? "العودة للجدول" : "Back to table"}
        </button>
      </div>
    </div>
  );

  if (isModal) return cardContent;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {cardContent}
      </div>
    </div>
  );
}

