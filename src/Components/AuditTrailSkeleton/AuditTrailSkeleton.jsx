import React from "react";
import styles from "./AuditTrailSkeleton.module.css";

export default function AuditTrailSkeleton({ rows = 3 }) {
  const skeletonArray = Array.from({ length: rows });

  return (
    <div className={styles.auditList}>
      {skeletonArray.map((_, index) => (
        <div key={index} className={styles.eventCard}>
          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={`${styles.statusDot} ${styles.dotSkeleton}`}></div>
              <span className={styles.statusBadgeSkeleton}></span>
            </div>
            <span className={styles.eventIdSkeleton}></span>
          </div>

          {/* Event Title */}
          <div className={styles.eventTitleSkeleton}></div>

          {/* Detail Grid */}
          <div className={styles.detailGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.detailItem}>
                <div className={styles.detailIconSkeleton}></div>
                <div className={styles.detailContent}>
                  <div className={styles.detailLabelSkeleton}></div>
                  <div className={styles.detailValueSkeleton}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Section */}
          <div className={styles.messageSection}>
            <div className={styles.messageIconSkeleton}></div>
            <div className={styles.messageContent}>
              <div className={styles.detailLabelSkeleton}></div>
              <div className={styles.messageTextSkeleton}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
