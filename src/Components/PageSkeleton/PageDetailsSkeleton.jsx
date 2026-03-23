import React from "react";
import styles from "./PageDetailsSkeleton.module.css";

export default function PageDetailsSkeleton({
  rows = 6,
  sections = 0,
  showActions = true,
}) {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={`${styles.skeleton} ${styles.title}`} />
      </div>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.detailsGrid}>
          {/* Main Rows */}
          {Array.from({ length: rows }).map((_, index) => (
            <div className={styles.detailRow} key={index}>
              <div className={`${styles.skeleton} ${styles.label}`} />
              <div className={`${styles.skeleton} ${styles.value}`} />
            </div>
          ))}

          {/* Optional Sections (like exams / training packages) */}
          {Array.from({ length: sections }).map((_, sectionIndex) => (
            <div key={sectionIndex} className={styles.sectionBlock}>
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <div className={styles.detailRow} key={rowIndex}>
                  <div className={`${styles.skeleton} ${styles.label}`} />
                  <div className={`${styles.skeleton} ${styles.value}`} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Actions */}
        {showActions && (
          <div className={styles.actions}>
            <div className={`${styles.skeleton} ${styles.button}`} />
            <div className={`${styles.skeleton} ${styles.button}`} />
            <div className={`${styles.skeleton} ${styles.button}`} />
          </div>
        )}
      </div>
    </div>
  );
}
