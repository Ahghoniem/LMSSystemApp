import React from "react";
import styles from "./PageNotFound.module.css";

export default function PageNotFound({
  title = "Not Found",
  message = "The requested data could not be found.",
  buttonText = "Back",
  onBack,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.icon}>404</div>
          <p className={styles.message}>{message}</p>

          {onBack && (
            <button className={styles.backButton} onClick={onBack}>
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
