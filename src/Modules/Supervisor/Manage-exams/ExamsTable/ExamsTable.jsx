import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../../Components/Paginator/Pagination";
import Table from "../../../../Components/Table/Table";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import styles from "./ExamsTable.module.css";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import {
  addOneDay,
  Decode_Token,
  formatDateOnly,
  getLang,
  getToken,
  splitLang,
} from "../../../../Utils";
import { useTranslation } from "react-i18next";
import DynamicFilters from "../../../../Components/Filters2";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { useDebounce } from "../../../../Hooks/useDebounce";


export default function ExamsTable() {
  const { t } = useTranslation("SupervisorTable");
  const token=getToken()
  const userData=Decode_Token(token)
  const navigate = useNavigate();
  const role =userData.role.toLowerCase()
  const lang = getLang();
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const debouncedFilters = useDebounce(filterValues, 500);

  const queryFilters = useMemo(() => {
    const cleaned = Object.fromEntries(
      Object.entries(debouncedFilters).filter(
        ([, v]) => v !== "" && v !== undefined
      )
    );
    if (cleaned["date[lte]"]) {
      cleaned["date[lte]"] = addOneDay(cleaned["date[lte]"]);
    }
    return cleaned;
  }, [debouncedFilters]);

  const {data:exams,isLoading}=useFetchData({
    baseUrl:`${API_BASE_URL}admin/examManagment/?supervisorId=${userData.id}`,
    queryKey:['exams',queryFilters],
    params:queryFilters,
    token,
    options: { keepPreviousData: true },
  })
  const data = exams?.data?.data;
  

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const pageSize = filterValues.limit;

  const columns = [
    {
      key: "event_eventName",
      label: t("examName"),
      render: (row) => {
        return lang !== "ar"
          ? splitLang(row.course.name).en
          : splitLang(row.course.name).ar
          ? splitLang(row.course.name).ar
          : row.course.name || "-";
      },
    },
    {
      key: "date",
      label: t("date"),
      render: (row) => formatDateOnly(row.date || row.event_startDate),
    },
    {
      key: "place",
      label: t("place"),
      render: (row) => row.place || "-",
    },
    {
      key: "event_status",
      label: t("status"),
      render: (row) => t(row.event.status),
    },
    {
      key: "event_numberOfRegistered",
      label: t("numberOfSubscribers"),
      render:(row)=>row.event.numberOfRegistered
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
      name: "course.name[contains]",
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
      name: "date[gte]",
      label: t("events.registrationStartDate"),
      type: "date",
    },
    {
      name: "date[lte]",
      label: t("events.registrationEndDate"),
      type: "date",
    },
  ];
  

  const handleRowClick = (exam) => {
    navigate(`/${role}/exam-subscribers/${exam.examId}`,{state:{examName:exam.course.name}});
  };

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("examsManagement")}</h1>

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
              data={data || []}
              currentPage={filterValues.page}
              pageSize={pageSize}
              onRowClicked={handleRowClick}
            />

            <Pagination
              total={exams?.data?.pagination?.total || 0}
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

