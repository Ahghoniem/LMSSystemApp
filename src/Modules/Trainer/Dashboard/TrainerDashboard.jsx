import React, { useMemo } from "react";
import styles from "../../Admin/Dashboard/Dashboard.module.css";
import { ArrowUpCircle, TrendingDown } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Decode_Token, getToken, formatDateOnly, splitLang } from "../../../Utils";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "../../../Constants";
import { getLang } from "../../../Utils";

const isCompletedStatus = (s) => {
  const status = (
    s?.status ||
    s?.Reservation?.status ||
    s?.Student?.status ||
    s?.reservationStatus ||
    ""
  ).toLowerCase();
  return ["completed", "examined", "graduated"].includes(status);
};

export default function TrainerDashboard() {
  const token = getToken();
  const data = Decode_Token(token);
  const lang = getLang();
  const name = data?.email ? data.email.split("@")[0] : "المدرب";

  const { data: trainingsData } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/trainingManagement/?trainerId=${data?.id}`,
    queryKey: ["trainerDashboardTrainings", data?.id],
    token,
  });

  const trainings = trainingsData?.data?.data || [];
  const trainingsForChart = trainings.slice(0, 10);

  const studentQueries = useQueries({
    queries: trainingsForChart.map((t) => ({
      queryKey: ["trainingStudents", t.trainingId],
      queryFn: async () => {
        const { data } = await axios.get(
          `${API_BASE_URL}admin/usersManagment/Training/${t.trainingId}/Students`,
          { params: { limit: 500 }, headers: { Authorization: `Bearer ${token}` } }
        );
        return { trainingId: t.trainingId, data };
      },
      enabled: Boolean(t.trainingId && token),
    })),
  });

  const completionChartData = useMemo(() => {
    return trainingsForChart.map((t, idx) => {
      const apiRes = studentQueries[idx]?.data?.data;
      const students = apiRes?.data?.data || [];
      const total = students.length || t.event?.numberOfRegistered || 0;
      const completed =
        total > 0
          ? students.filter(isCompletedStatus).length
          : t.event?.numberOfCompleted ?? 0;
      const percentage =
        total > 0 ? Math.round((completed / total) * 100) : 0;
      const eventName = t.event?.eventName || t.event?.event_eventName || "";
      const label =
        lang === "ar"
          ? splitLang(eventName).ar || splitLang(eventName).en || eventName
          : splitLang(eventName).en || splitLang(eventName).ar || eventName;
      return {
        name: label || `دورة ${idx + 1}`,
        percentage,
        completed,
        total,
      };
    });
  }, [trainingsForChart, studentQueries, lang]);

  const totalTrainings = trainings.length;
  const activeTrainings = trainings.filter(
    (t) => t.event?.status === "opend"
  ).length;
  const totalRegistered = trainings.reduce(
    (sum, t) => sum + (t.event?.numberOfRegistered || 0),
    0
  );
  const upcomingCount = trainings.filter((t) => {
    const end = t.event?.endDate || t.event?.event_endDate;
    if (!end) return false;
    try {
      const endDate = new Date(formatDateOnly(end));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return endDate >= today;
    } catch {
      return false;
    }
  }).length;

  return (
    <div className={styles.dashboardWrapper}>
      <h2 className={styles.pageTitle}>لوحة تحكم المدرب {name}</h2>

      <div className={styles.counters}>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>{totalTrainings}</p>
          <span>إجمالي الدورات</span>
        </div>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>{activeTrainings}</p>
          <span>الدورات النشطة</span>
        </div>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>{totalRegistered}</p>
          <span>إجمالي المتدربين</span>
        </div>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>{upcomingCount}</p>
          <span>الدورات القادمة</span>
        </div>
      </div>

      <div className={styles.analyticsBox}>
        <h3 className={styles.sectionTitle}>ملخص الدورات</h3>

        <div className={styles.resultsRow}>
          <div className={`${styles.resultCard} ${styles.successCard}`}>
            <h4>الدورات النشطة</h4>
            <h2>{activeTrainings} دورة</h2>
            <div className={styles.resultGrowth}>
              <ArrowUpCircle color="#22c55e" size={22} />
              <span>مفتوحة للتسجيل</span>
            </div>
          </div>

          <div className={`${styles.resultCard} ${styles.failCard}`}>
            <h4>الدورات القادمة</h4>
            <h2>{upcomingCount} دورة</h2>
            <div className={styles.resultGrowth}>
              <TrendingDown color="#ef4444" size={22} />
              <span>قيد الإعداد</span>
            </div>
          </div>
        </div>

        {completionChartData.length > 0 && (
          <div className={styles.chartsRow}>
            <div className={styles.chartContainerLarge}>
              <h4 className={styles.chartTitle}>
                نسبة إكمال المتدربين لكل دورة
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={completionChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="percentage"
                    nameKey="name"
                  >
                    {completionChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={[
                          "var(--dark-blue)",
                          "var(--gold)",
                          "#22c55e",
                          "#3b82f6",
                          "#8b5cf6",
                          "#ec4899",
                          "#f97316",
                          "#06b6d4",
                          "#84cc16",
                          "#ef4444",
                        ][index % 10]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        const d = payload[0].payload;
                        return (
                          <div
                            style={{
                              background: "#fff",
                              padding: "8px 12px",
                              borderRadius: 8,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                          >
                            <strong>{d.name}</strong>
                            <br />
                            {d.percentage}% ({d.completed}/{d.total})
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.nationalityStats}>
                {completionChartData.map((item, index) => (
                  <div key={index} className={styles.nationalityItem}>
                    <span
                      className={styles.colorDot}
                      style={{
                        backgroundColor: [
                          "var(--dark-blue)",
                          "var(--gold)",
                          "#22c55e",
                          "#3b82f6",
                          "#8b5cf6",
                          "#ec4899",
                          "#f97316",
                          "#06b6d4",
                          "#84cc16",
                          "#ef4444",
                        ][index % 10],
                      }}
                    />
                    <span>{item.name}: </span>
                    <strong>{item.percentage}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
