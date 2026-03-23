import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Filters from "../../../../Components/Filters/Filters";
import Pagination from "../../../../Components/Paginator/Pagination";
import Table from "../../../../Components/Table/Table";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import styles from "./TrainingsTable.module.css";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import {
  addOneDay,
  Decode_Token,
  flattenEvents,
  formatDateOnly,
  getLang,
  getToken,
  splitLang,
} from "../../../../Utils";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../../Hooks/useDebounce";
import DynamicFilters from "../../../../Components/Filters2";

export default function TrainingsTable() {
  const { t } = useTranslation("TrainerTable");
  const navigate = useNavigate();
  const token = getToken();
  const lang = getLang();
  const tokenData = Decode_Token(token);
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const debouncedFilters = useDebounce(filterValues, 500);

  const queryFilters = useMemo(() => {
    const cleaned = Object.fromEntries(
      Object.entries(debouncedFilters).filter(
        ([, v]) => v !== "" && v !== undefined
      )
    );
    if (cleaned["event.endDate[lte]"]) {
      cleaned["event.endDate[lte]"] = addOneDay(cleaned["event.endDate[lte]"]);
    }
    return cleaned;
  }, [debouncedFilters]);

  const { data: events, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/trainingManagement/?trainerId=${tokenData?.id}`,
    queryKey: ["trainings", queryFilters],
    params: queryFilters,
    token,
    options: { keepPreviousData: true },
  });

  const data = events?.data?.data || [];
  const flattenedEvents = flattenEvents(data);

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const pageSize = filterValues.limit;

  const columns = [
    {
      key: "event_eventName",
      label: t("trainingName"),
      render: (row) => {
        return lang !== "ar"
          ? splitLang(row.course_name).en
          : splitLang(row.course_name).ar
          ? splitLang(row.course_name).ar
          : row.course_name || "-";
      },
    },
    {
      key: "registrationStartDate",
      label: t("startDate"),
      render: (row) => formatDateOnly(row.event_startDate),
    },
    {
      key: "registrationEndDate",
      label: t("endDate"),
      render: (row) => formatDateOnly(row.event_endDate),
    },
    { key: "event_capacity", label: t("capacity") },
    { key: "event_numberOfRegistered", label: t("registeredCount") },
    {
      key: "event_status",
      label: t("status"),
      render: (row) => t(row.event_status),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (row) => (
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={styles.btnAction}
            onClick={() => handleSessionsClick(row)}
          >
            {t("sessions")}
          </button>
          <button
            type="button"
            className={styles.btnActionSecondary}
            onClick={() => handleUsersClick(row)}
          >
            {t("users")}
          </button>
        </div>
      ),
    },
  ];

  const filters = [
    {
      name: "limit",
      label: t("events.limit"),
      type: "select",
      options: [
        { value: "10", label: "10" },
        { value: "20", label: "20" },
        { value: "30", label: "30" },
        { value: "40", label: "40" },
        { value: "50", label: "50" },
      ],
      placeholder: t("select"),
    },
    {
      name: "event.eventName[contains]",
      label: t("events.title"),
      type: "text",
    },
    {
      name: "event.status[contains]",
      label: t("events.status"),
      type: "select",
      options: [
        { value: "opend", label: t("opend") },
        { value: "closed", label: t("closed") },
      ],
      placeholder: t("select"),
    },
    {
      name: "event.startDate[gte]",
      label: t("events.registrationStartDate"),
      type: "date",
    },
    {
      name: "event.endDate[lte]",
      label: t("events.registrationEndDate"),
      type: "date",
    },
  ];

  const handleSessionsClick = (event) => {
    navigate(`/trainer/all-sessions?trainingId=${event.trainingId}`);
  };

  const handleUsersClick = (event) => {
    navigate(`/trainer/training-users?trainingId=${event.trainingId}`);
  };

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("trainingsManagement")}</h1>

      <div className={styles.tableContainer}>
        <DynamicFilters
          filters={filters}
          values={filterValues}
          onChange={handleChange}
          setFilters={setFilterValues}
        />

        {isLoading ? (
          <SkeletonLoader rows={pageSize} />
        ) : (
          <>
            <Table
              columns={columns}
              data={flattenedEvents || []}
              currentPage={filterValues.page}
              pageSize={pageSize}
            />

            <Pagination
              total={events?.data?.pagination?.total || 0}
              currentPage={filterValues.page}
              setCurrentPage={(page) =>
                setFilterValues((prev) => ({ ...prev, page }))
              }
              pageSize={filterValues.limit}
            />
          </>
        )}
      </div>
    </div>
  );
}
