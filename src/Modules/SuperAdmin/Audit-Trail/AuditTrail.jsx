import React, { useMemo, useState } from "react";
import styles from "./AuditTrail.module.css";
import { useTranslation } from "react-i18next";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../Constants";
import { useDebounce } from "../../../Hooks/useDebounce";
import DynamicFilters from "../../../Components/Filters2";
import { addOneDay, formatDateOnly, getLang, getToken, parseUserAgentAdvanced, splitLang } from "../../../Utils";
import { getExactTime } from "./../../../Components/Chat/FormatTimeAndDate";
import { logsMap } from "./logsMap";
import Pagination from "../../../Components/Paginator/Pagination";
import AuditTrailSkeleton from "../../../Components/AuditTrailSkeleton/AuditTrailSkeleton";

export default function AuditTrail() {
  const { t } = useTranslation("auditTrail");
  const token = getToken();
  const lang = getLang();
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const debouncedFilters = useDebounce(filterValues, 500);

  const queryFilters = useMemo(() => {
          const cleaned = Object.fromEntries(
            Object.entries(debouncedFilters).filter(
              ([, v]) => v !== "" && v !== undefined
            )
          );
          if (cleaned["createdAt[lte]"]) {
            cleaned["createdAt[lte]"] = addOneDay(cleaned["createdAt[lte]"]);
          }
          return cleaned;
        }, [debouncedFilters]);

  const { data,isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}logs`,
    queryKey: ["auditTrail", queryFilters],
    params: queryFilters,
    token,
  });

  const auditData = data?.data?.items;
  
  const filters = [
    {
      name: "limit",
      label: t("limit"),
      type: "select",
      options: [
        { value: "10", label: "10" },
        { value: "20", label: "20" },
        { value: "30", label: "30" },
        { value: "50", label: "50" },
      ],
      placeholder: t("select"),
    },
    {
      name: "ip[contains]",
      label: t("search"),
      type: "text",
      grow: true,
      placeholder: t("searchPlaceholder"),
    },
    {
      name: "level",
      label: t("status"),
      type: "select",
      options: [
        { value: "success", label: t("success") },
        { value: "error", label: t("failed") },
      ],
      placeholder: t("select"),
    },
    {
      name: "type",
      label: t("recordType"),
      type: "select",
      options: Object.entries(logsMap).map(([key, value]) => ({
        value: key,
        label: value[lang],
      })),
      placeholder: t("select"),
    },
    { name: "createdAt[gte]", label: t("startDate"), type: "date" },
    { name: "createdAt[lte]", label: t("endDate"), type: "date" },
  ];

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const getStatusClass = (status) => {
    return status === "success" ? styles.statusSuccess : styles.statusFailed;
  };

  const getStatusDotClass = (status) => {
    return status === "success" ? styles.dotSuccess : styles.dotFailed;
  };

  return (
    <main className={styles.content}>
      <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>

      <div className={styles.tableContainer}>
        <DynamicFilters
          filters={filters}
          values={filterValues}
          onChange={handleChange}
          setFilters={setFilterValues}
        />

        <div className={styles.auditList}>
          {isLoading?
          <AuditTrailSkeleton rows={10} />:
          auditData?.length > 0 ? (
            auditData.map((item, index) => (
              <div key={index} className={styles.eventCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <div
                      className={`${styles.statusDot} ${getStatusDotClass(
                        item.level
                      )}`}
                    ></div>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        item.level
                      )}`}
                    >
                      {item.level === "success" ? t("sucessTry") : t("failTry")}
                    </span>
                  </div>
                  <span className={styles.eventId}>#{item.id}</span>
                </div>

                <h3 className={styles.eventTitle}>
                  {lang === "ar"
                    ? splitLang(item.title).ar
                    : splitLang(item.title).en}
                </h3>

                <div className={styles.eventDetails}>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>
                        <i className="fa-solid fa-network-wired"></i>
                      </div>
                      <div className={styles.detailContent}>
                        <label className={styles.detailLabel}>
                          {t("ipAddress")}
                        </label>
                        <span className={styles.detailValue}>{item.ip}</span>
                      </div>
                    </div>

                    {item.user && (
                      <>
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>
                            <i className="fa-solid fa-id-card"></i>
                          </div>
                          <div className={styles.detailContent}>
                            <label className={styles.detailLabel}>
                              {t("userId")}
                            </label>
                            <span className={styles.detailValue}>
                              {item.user._id}
                            </span>
                          </div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>
                            <i className="fa-solid fa-id-card"></i>
                          </div>
                          <div className={styles.detailContent}>
                            <label className={styles.detailLabel}>
                              {t("username")}
                            </label>
                            <span className={styles.detailValue}>
                              {lang === 'ar' ? splitLang(item.user.name).ar ?? item.user.name : splitLang(item.user.name).en ?? item.user.name}
                            </span>
                          </div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>
                            <i className="fa-solid fa-id-card"></i>
                          </div>
                          <div className={styles.detailContent}>
                            <label className={styles.detailLabel}>
                              {t("email")}
                            </label>
                            <span className={styles.detailValue}>
                              {item.user.email}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>
                        <i className="fa-solid fa-clock"></i>
                      </div>
                      <div className={styles.detailContent}>
                        <label className={styles.detailLabel}>
                          {t("time")}
                        </label>
                        <span className={styles.detailValue}>
                          {getExactTime(item.createdAt, lang)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>
                        <i className="fa-solid fa-clock"></i>
                      </div>
                      <div className={styles.detailContent}>
                        <label className={styles.detailLabel}>
                          {t("Date")}
                        </label>
                        <span className={styles.detailValue}>
                          {formatDateOnly(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>
                        <i className="fa-solid fa-tag"></i>
                      </div>
                      <div className={styles.detailContent}>
                        <label className={styles.detailLabel}>
                          {t("recordType")}
                        </label>
                        <span className={styles.detailValue}>
                          {logsMap[item.type]?.[lang] ?? item.type}
                        </span>
                      </div>
                    </div>

                    {item.userAgent && (
                      <div className={styles.detailItem}>
                        <div className={styles.detailIcon}>
                          <i className="fa-solid fa-mobile-screen"></i>
                        </div>
                        <div className={styles.detailContent}>
                          <label className={styles.detailLabel}>
                            {t("device")}
                          </label>
                          <span className={styles.detailValue}>
                            {parseUserAgentAdvanced(item.userAgent,lang)}
                          </span>
                        </div>
                      </div>
                    )}
                    {item.affectedThing && (
                      <div className={styles.detailItem}>
                        <div className={styles.detailIcon}>
                          <i className="fa-solid fa-mobile-screen"></i>
                        </div>
                        <div className={styles.detailContent}>
                          <label className={styles.detailLabel}>
                            {t("affectedThings")}
                          </label>
                          <span className={styles.detailValue}>
                            {lang === 'ar' ? splitLang(item?.affectedThing?.name).ar : splitLang(item?.affectedThing?.name).en}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.messageSection}>
                    <div className={styles.messageIcon}>
                      <i className="fa-solid fa-message"></i>
                    </div>
                    <div className={styles.messageContent}>
                      <label className={styles.detailLabel}>
                        {t("message")}
                      </label>
                      <span className={styles.messageText}>{lang === 'ar' ? splitLang(item.message).ar ?? item.message : splitLang(item.message).en ?? item.message}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <i className="fa-solid fa-inbox"></i>
              <p>{t("noData")}</p>
            </div>
          )}
        </div>
        <Pagination
          total={data?.data?.totalItems || 0}
          currentPage={filterValues.page}
          setCurrentPage={(page) =>
            setFilterValues((prev) => ({ ...prev, page }))
          }
          pageSize={filterValues.limit}
        />
      </div>
    </main>
  );
}
