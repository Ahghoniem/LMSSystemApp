import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Table from "../../../../Components/Table/Table";
import Pagination from "../../../../Components/Paginator/Pagination";
import DynamicFilters from "../../../../Components/Filters2";
import styles from "./SessionAttendance.module.css";
import {
  addOneDay,
  formatDateOnly,
  getLang,
  getToken,
} from "../../../../Utils";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { getExactTime } from "../../../../Components/Chat/FormatTimeAndDate";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import { useDebounce } from "../../../../Hooks/useDebounce";

export default function SessionAttendance() {
  const { t } = useTranslation("SessionAttendance");
  const [searchParams] = useSearchParams();
  const token = getToken();
  const lang = getLang();
  const sessionId = searchParams.get("sessionId");
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

  const { data: sessionData, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}Attendance/Session-Attendance/${sessionId}`,
    queryKey: ["SessionAttendance", sessionId, queryFilters],
    params: queryFilters,
    token,
    options: { enabled: Boolean(sessionId), keepPreviousData: true },
  });

  const rawData = sessionData?.data?.data ?? [];

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const filters = [
    {
      name: "limit",
      label: t("limit"),
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
      name:
        lang === "ar"
          ? "Student.fullName[contains]"
          : "Student.NameEn[contains]",
      label: t("filters.searchByName"),
      type: "text",
      placeholder: t("filters.name"),
    },
    {
      name: "createdAt[gte]",
      label: t("filters.fromDate"),
      type: "date",
    },
    {
      name: "createdAt[lte]",
      label: t("filters.toDate"),
      type: "date",
    },
  ];

  const columns = [
    {
      key: "name",
      label: t("table.name"),
      render: (row) =>
        (lang === "ar" ? row.Student?.fullName : row.Student?.NameEn) ?? "-",
    },
    {
      key: "date",
      label: t("table.date"),
      render: (row) => formatDateOnly(row.createdAt),
    },
    {
      key: "time",
      label: t("table.time"),
      render: (row) => getExactTime(row.createdAt, lang),
    },
    {
      key: "status",
      label: t("table.status"),
      render: () => <p>{t("table.presence")}</p>,
    },
  ];

  const pageSize = filterValues.limit;

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("title")}</h1>

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
              data={rawData}
              currentPage={filterValues.page}
              pageSize={pageSize}
            />

            <Pagination
              total={sessionData?.data?.pagination?.total || 0}
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
