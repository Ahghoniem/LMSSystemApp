import React from "react";
import styles from "./ProfileSkeleton.module.css";

export default function ProfileSkeleton() {
  return (
    <main className={styles.content}>
      <div className={styles.profileWrapper}>
        <div className={styles.profileCard}>
          {/* Header / Form Title */}
          <div className={styles.formTitle}></div>

          {/* Personal Info Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}></div>
            <div className={styles.profileGrid}>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
            </div>
          </div>

          {/* Registration Info Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}></div>
            <div className={styles.profileGrid}>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
            </div>
          </div>

          {/* Payment Info Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}></div>
            <div className={styles.profileGrid}>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
              <div className={styles.field}></div>
            </div>
          </div>

          {/* Button */}
          <div className={styles.submitBtn}></div>
        </div>
      </div>
    </main>
  );
}
