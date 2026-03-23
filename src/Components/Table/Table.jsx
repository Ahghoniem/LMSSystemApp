import React from "react";
import styles from "./Table.module.css";
import { useTranslation } from "react-i18next";

export default function Table({ columns = [], data = [], onRowClicked }) {
  const { t } = useTranslation("table");
  const handleRowClick = (e, row) => {
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest("input") ||
      e.target.closest("select")
    ) {
      return;
    }

    if (onRowClicked) onRowClicked(row);
  };

  return (
    <table className={styles.studentsTable}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.length > 0 ? (
          data.map((row) => (
            <tr
              key={row.id || Math.random()}
              onClick={(e) => handleRowClick(e, row)}
              className={onRowClicked ? styles.rowClic : ""}
            >
              {columns.map((col) => (
                <td key={col.key} data-label={col.label}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className={styles.emptyRowMobile}>
              <div className={styles.emptyState}>
                <i className="fa-solid fa-folder-open"></i>
                <h3>{t("noData")}</h3>
                <p>{t("explain")}.</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
