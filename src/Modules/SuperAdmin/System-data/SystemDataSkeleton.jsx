import React from "react";
import styles from "./SystemData.module.css";

export default function SystemDataSkeleton() {
  return (
    <div className={styles.systemDataPage}>
      <div className={styles.systemBox}>
        {/* Header */}
        <div
          className={`${styles.systemHeader} ${styles.skeletonBlock}`}
          style={{ width: "250px", height: "30px", margin: "0 auto" ,marginBottom:"15px"}}
        />

        {/* Form */}
        <form className={styles.formGrid}>
          {/* First Signer */}
          <div className={styles.formGroup}>
            <div
              className={styles.skeletonBlock}
              style={{ width: "100%", height: "38px" }}
            />
          </div>

          {/* Second Signer */}
          <div className={styles.formGroup}>
            <div
              className={styles.skeletonBlock}
              style={{ width: "100%", height: "38px" }}
            />
          </div>

          {/* First Job */}
          <div className={styles.formGroup}>
            <div
              className={styles.skeletonBlock}
              style={{ width: "100%", height: "38px" }}
            />
          </div>

          {/* Second Job */}
          <div className={styles.formGroup}>
            <div
              className={styles.skeletonBlock}
              style={{ width: "100%", height: "38px" }}
            />
          </div>

          {/* Allowed Attempts */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div
              className={styles.skeletonBlock}
              style={{ width: "100%", height: "38px" }}
            />
          </div>

          {/* Submit Button */}
          <div
            className={styles.skeletonBlock}
            style={{ width: "150px", height: "45px", gridColumn: "1 / -1" }}
          />
        </form>
      </div>
    </div>
  );
}