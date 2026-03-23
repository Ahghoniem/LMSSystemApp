import React from "react";
import styles from "./RegisterForm.module.css";

export default function ProgressBar({ steps, currentStep }) {
  return (
    <div className={styles.progressbar}>
      {steps.map((title, index) => (
        <div
          key={index}
          className={`${styles.progressStep} ${
            currentStep === index ? styles.activeStep : ""
          } ${index < currentStep ? styles.completedStep : ""}`}
          data-title={title}
        >
          <span>{index + 1}</span>
        </div>
      ))}
    </div>
  );
}
