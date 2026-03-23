import React, { useMemo } from "react";
import styles from "./ProgressBar.module.css";
import { useTranslation } from "react-i18next";

const ProgressBar = ({ currentStatus, userData }) => {
  const { t } = useTranslation("progress");
  const courseName = userData?.User?.Payments?.[0]?.Product?.courseName || "";

  const stages = useMemo(() => {
    const baseStages = [
      { id: 1, label: t("progressBar.registered"), status: "registered" },
      { id: 2, label: t("progressBar.paid"), status: "paid" },
      { id: 3, label: t("progressBar.reservedTraining"), status: "reserved Training" },
      { id: 4, label: t("progressBar.reservedExam"), status: currentStatus === "failed" ?"failed": "reserved Exam" },
      { id: 5, label: t("progressBar.completed"), status: "succeeded" },
    ];

    if (courseName.includes("Exam+Study_Material | امتحان + مادة علمية")) {
      return baseStages.filter(stage => stage.status !== "reserved Training");
    }

    return baseStages;
  }, [t, courseName,currentStatus]);

  const currentStage = useMemo(() => {
    const statusMap = {
      approved: 2,
      paid: 2,
      "reserved Training": 3,
      "reserved Exam": 4,
      "failed":4,
      succeeded: 5,
      completed: 6,
    };
    if (!userData) return statusMap[currentStatus] || 1;

    let stage = 1;
    switch (userData.status) {
      case "approved":
      case "paid":
        stage = 2;
        break;
      case "reserved Training":
        stage = 3;
        break;
      case "reserved Exam":
        stage = 4;
        break;
      case "succeeded":
        stage = 5;
        break;
      case "completed":
        stage = 6;
        break;
      case "failed":
        stage = 4;
        break;
      default:
        stage = 1;
    }
    if (
      courseName.includes("Exam+Study_Material | امتحان + مادة علمية") &&
      stage > 2
    ) {
      stage -= 1;
    }

    return stage;
  }, [userData, currentStatus, courseName]);

  return (
    <div className={styles.progressBarContainer}>
      <div className={styles.progressBar}>
        {stages.map((stage, index) => {
          const isActive = stage.id <= currentStage;
          const isCompleted = stage.id < currentStage;
          const isCurrent = stage.id === currentStage;

          return (
            <div
              key={stage.id}
              className={`${styles.stageWrapper} ${
                isCompleted ? styles.completedWrapper : ""
              }`}
            >
              <div className={styles.stageItem}>
                <div
                  className={`${styles.stageCircle} ${
                    isActive ? styles.active : ""
                  } ${isCurrent ? styles.current : ""}`}
                >
                  {isCompleted ? <i className="fas fa-check"></i> : <span>{stage.id}</span>}
                </div>

                <span
                  className={`${styles.stageLabel} ${
                    isActive ? styles.activeLabel : ""
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {index < stages.length - 1 && (
                <div
                  className={`${styles.stageLine} ${
                    stage.id < currentStage ? styles.activeLine : ""
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;