import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./Pagination.module.css";
import { getLang } from "../../Utils";

export default function Pagination({
  total,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  showPageSize = false,
}) {
  
  const { t } = useTranslation("paginator");
  const lang = getLang();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleLimitChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // reset to first page when limit changes
  };

  return (
    <div className={styles.pager}>
      <div className={styles.pagerActions}>
        <button
          className={styles.btnFirst}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          <i className="fa-solid fa-angles-up"></i> {t("first")}
        </button>

        <button
          className={styles.btnPrev}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          {lang === "ar" ? (
            <i className="fa-solid fa-arrow-right-long"></i>
          ) : (
            <i className="fa-solid fa-arrow-left-long"></i>
          )}{" "}
          {t("previous")}
        </button>

        <span className={styles.pagerInfo}>
          {t("page")} {currentPage} {t("of")} {totalPages} |{" "}
          {t("records")} {total}
        </span>

        <button
          className={styles.btnNext}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {t("next")}
        </button>

        {showPageSize && (
          <select
            className={styles.pageSizeSelect}
            value={pageSize}
            name="limit"
            onChange={handleLimitChange}
          >
            {[5, 10, 20, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}