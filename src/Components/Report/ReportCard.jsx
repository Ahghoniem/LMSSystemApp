import React, { useState } from "react";
import styles from "./ReportCard.module.css";
import { FaRegFileAlt } from "react-icons/fa";

const ReportCard = ({ popupDescription }) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <article className={styles.reportCard}>
        <i className={`fa-solid fa-file-lines ${styles.cardIcon}`} aria-hidden="true"></i>
        <h2 className={styles.cardTitle}>تقرير المتدربين</h2>
        <p className={styles.cardDesc}>
          يمكنك تصدير تقرير بجميع المتدربين المسجلين في النظام بسهولة.
        </p>
        <button className={styles.btnPrimary} onClick={() => setShowPopup(true)}>
          تصدير التقرير
        </button>
      </article>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <FaRegFileAlt className={styles.popupIcon} />
              <h4>تصدير التقرير</h4>
            </div>

            <p className={styles.popupText}>
              {popupDescription || "اختر صيغة التصدير المناسبة للتقرير."}
            </p>

            <div className={styles.popupButtons}>
              <button className={styles.pdfBtn}>PDF</button>
              <button className={styles.excelBtn}>Excel</button>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowPopup(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportCard;
