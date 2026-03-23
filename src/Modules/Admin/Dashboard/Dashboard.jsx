import React from "react";
import styles from "./Dashboard.module.css";
import { ArrowUpCircle, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTranslation } from "react-i18next";
import { capitalizeFirst, Decode_Token, getToken } from "../../../Utils";

export default function Dashboard() {
  const { t } = useTranslation("dashboard");
  const data=Decode_Token(getToken())
  const name=data.email.split("@")
  
  // Weekdays translated dynamically
  const performanceData = [
    { day: t("saturday"), success: 80, fail: 20 },
    { day: t("sunday"), success: 95, fail: 15 },
    { day: t("monday"), success: 70, fail: 30 },
    { day: t("tuesday"), success: 115, fail: 25 },
    { day: t("wednesday"), success: 98, fail: 18 },
    { day: t("thursday"), success: 124, fail: 16 },
    { day: t("friday"), success: 109, fail: 21 },
  ];

  const nationalityData = [
    { name: t("egyptianStudents"), value: 430, className: "egyptians" },
    { name: t("foreignStudents"), value: 170, className: "foreigners" },
  ];

  const total = nationalityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={styles.dashboardWrapper}>
      <h2 className={styles.pageTitle}>{t("pageTitle")+`${capitalizeFirst(name[0])}`}</h2>

      <div className={styles.counters}>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>150</p>
          <span>{t("coursesCount")}</span>
        </div>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>320</p>
          <span>{t("traineesCount")}</span>
        </div>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>280</p>
          <span>{t("completedExams")}</span>
        </div>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>120</p>
          <span>{t("todayPayments")}</span>
        </div>
      </div>

      <div className={styles.analyticsBox}>
        <h3 className={styles.sectionTitle}>{t("resultsStats")}</h3>

        <div className={styles.resultsRow}>
          <div className={`${styles.resultCard} ${styles.successCard}`}>
            <h4>{t("successfulStudents")}</h4>
            <h2>420 {t("students")}</h2>
            <div className={styles.resultGrowth}>
              <ArrowUpCircle color="#22c55e" size={22} />
              <span>{t("growthUp")}</span>
            </div>
          </div>

          <div className={`${styles.resultCard} ${styles.failCard}`}>
            <h4>{t("failedStudents")}</h4>
            <h2>95 {t("students")}</h2>
            <div className={styles.resultGrowth}>
              <TrendingDown color="#ef4444" size={22} />
              <span>{t("growthDown")}</span>
            </div>
          </div>
        </div>

        <div className={styles.chartsRow}>
          {/* Performance Chart */}
          <div className={styles.chartContainerLarge}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name={t("successfulStudents")}
                />
                <Line
                  type="monotone"
                  dataKey="fail"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name={t("failedStudents")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Nationality Pie Chart */}
          <div className={styles.chartContainerLarge}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={nationalityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >
                  {nationalityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      className={styles[entry.className]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className={styles.nationalityStats}>
              {nationalityData.map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={index} className={styles.nationalityItem}>
                    <span
                      className={`${styles.colorDot} ${styles[item.className]}`}
                    ></span>
                    <span>{item.name}: </span>
                    <strong>{percentage}%</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
