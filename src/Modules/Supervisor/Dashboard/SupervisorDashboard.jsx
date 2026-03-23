import React from "react";
import styles from "../../Admin/Dashboard/Dashboard.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useTranslation } from "react-i18next";
import { capitalizeFirst, Decode_Token, getToken, getLang } from "../../../Utils";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../Constants";

export default function SupervisorDashboard() {
  const { t } = useTranslation("dashboard");
  const token = getToken();
  const data = Decode_Token(token);
  const lang = getLang();
  const name = data?.email ? data.email.split("@")[0] : "";

  const { data: examsData } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/examManagment/?supervisorId=${data?.id}`,
    queryKey: ["supervisorExams", data?.id],
    token,
  });

  const exams = examsData?.data?.data || [];
  const totalExams = exams.length;
  const activeExams = exams.filter((e) => e.event?.status === "opend").length;
  const closedExams = exams.filter((e) => e.event?.status === "closed").length;
  const totalRegistered = exams.reduce(
    (sum, e) => sum + (e.event?.numberOfRegistered || 0),
    0
  );

  const completionRate =
    totalExams > 0 ? ((closedExams / totalExams) * 100).toFixed(1) : 0;

  const statusData = [
    {
      name: lang === "ar" ? "نشط" : "Active",
      value: activeExams,
    },
    {
      name: lang === "ar" ? "مغلق" : "Closed",
      value: closedExams,
    },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      <h2 className={styles.pageTitle}>
        {t("pageTitle")}
        {capitalizeFirst(name)}
      </h2>

      <div className={styles.counters}>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>{totalExams}</p>
          <span>{lang === "ar" ? "إجمالي الامتحانات" : "Total exams"}</span>
        </div>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>{activeExams}</p>
          <span>{lang === "ar" ? "الامتحانات النشطة" : "Active exams"}</span>
        </div>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>{closedExams}</p>
          <span>{lang === "ar" ? "الامتحانات المغلقة" : "Closed exams"}</span>
        </div>
        <div className={styles.counterCard}>
          <p className={styles.counterNumber}>{completionRate}%</p>
          <span>{lang === "ar" ? "نسبة الإغلاق" : "Completion Rate"}</span>
        </div>
      </div>

      <div className={styles.analyticsBox}>
        <h3 className={styles.sectionTitle}>{t("resultsStats")}</h3>

        {totalRegistered === 0 && totalExams > 0 && (
          <div
            className={styles.chartContainerLarge}
            style={{
              padding: 40,
              textAlign: "center",
              opacity: 0.8,
              marginBottom: "1rem",
            }}
          >
            {lang === "ar"
              ? "لا يوجد طلاب مسجلين حتى الآن"
              : "No students registered yet"}
          </div>
        )}

        {totalExams > 0 ? (
          <div className={styles.chartsRow}>
            <div className={styles.chartContainerLarge}>
              <h4 className={styles.chartTitle}>
                {lang === "ar"
                  ? "توزيع حالة الامتحانات"
                  : "Exam Status Distribution"}
              </h4>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: "#ccc", strokeWidth: 1 }}
                    tickLine={{ stroke: "#ccc" }}
                    tick={{ fontSize: 13, fill: "#0a2a4d", fontWeight: 600 }}
                    tickMargin={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={{ stroke: "#ccc", strokeWidth: 1 }}
                    tickLine={{ stroke: "#ccc" }}
                    tick={{ fontSize: 13, fill: "#0a2a4d", fontWeight: 600 }}
                    tickMargin={8}
                    domain={[0, "auto"]}
                  />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div style={{ background: "#fff", padding: "10px 14px", borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: "1px solid #eee" }}>
                          <strong>{payload[0].payload.name}:</strong> {payload[0].value}
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} minPointSize={5} activeBar={false}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#22c55e" : "var(--gold, #b38e19)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: "center", opacity: 0.6 }}>
            {lang === "ar"
              ? "لا توجد امتحانات حالياً"
              : "No exams available"}
          </div>
        )}
      </div>
    </div>
  );
}
