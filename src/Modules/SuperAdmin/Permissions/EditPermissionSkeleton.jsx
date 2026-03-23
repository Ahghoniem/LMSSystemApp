import React from "react";
import styles from "./EditPermissionFile.module.css";

export default function EditPermissionSkeleton() {
  return (
    <div className={styles.editPermissionPage}>
      <div className={styles.wrapper}>
        <div className={styles.permissionBox}>
          {/* Header */}
          <div className={`${styles.permissionHeader} ${styles.skeletonBlock}`} style={{ height: "30px", width: "200px", margin: "0 auto" }} />

          {/* Basic Info Section */}
          <div className={styles.formSection}>
            <div className={`${styles.sectionTitle} ${styles.skeletonBlock}`} style={{ width: "180px", height: "22px" }} />
            <div className={`${styles.sectionDesc} ${styles.skeletonBlock}`} style={{ width: "60%", height: "14px", marginTop: "6px" }} />

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <div className={`${styles.skeletonBlock}`} style={{ width: "100%", height: "38px" }} />
              </div>
              <div className={styles.formGroup}>
                <div className={`${styles.skeletonBlock}`} style={{ width: "100%", height: "38px" }} />
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className={styles.permissionsSection}>
            <div className={`${styles.permissionsTitle} ${styles.skeletonBlock}`} style={{ width: "180px", height: "22px" }} />
            <div className={`${styles.permissionsDesc} ${styles.skeletonBlock}`} style={{ width: "50%", height: "14px", marginBottom: "20px" }} />

            {[...Array(3)].map((_, idx) => (
              <div key={idx} className={styles.permissionsBox}>
                <div className={styles.boxTitleContainer}>
                  <div className={`${styles.boxTitle} ${styles.skeletonBlock}`} style={{ width: "140px", height: "18px" }} />
                  <div className={`${styles.btnView} ${styles.skeletonBlock}`} style={{ width: "80px", height: "28px" }} />
                </div>

                <div className={styles.permsGrid}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={styles.permItem}>
                      <div className={`${styles.skeletonBlock}`} style={{ width: "18px", height: "18px", borderRadius: "4px" }} />
                      <div className={`${styles.skeletonBlock}`} style={{ width: "100px", height: "16px" }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center" style={{ marginTop: "20px" }}>
            <div className={styles.buttonsContainer}>
              <div className={`${styles.skeletonBlock}`} style={{ width: "120px", height: "38px" }} />
              <div className={`${styles.skeletonBlock}`} style={{ width: "140px", height: "38px" }} />
            </div>
            <div className={`${styles.skeletonBlock}`} style={{ width: "150px", height: "38px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}