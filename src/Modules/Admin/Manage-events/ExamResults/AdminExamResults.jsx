import React, { useMemo, useState } from "react";
import Table from "../../../../Components/Table/Table";
import styles from "../../Manage-users/Users-table/UsersTable.module.css";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { addOneDay, formatDateOnly, getLang, splitLang } from "../../../../Utils";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { useTranslation } from "react-i18next";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { useParams } from "react-router";
import DynamicFilters from "../../../../Components/Filters2";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import Pagination from "../../../../Components/Paginator/Pagination";

export default function AdminExamResults() {
  const { t } = useTranslation("AdminExamResults");
  const { id } = useParams();
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const lang = getLang();
  const debouncedFilters = useDebounce(filterValues, 300);

  const queryFilters = useMemo(() => {
    const cleaned = Object.fromEntries(
      Object.entries(debouncedFilters).filter(
        ([, v]) => v !== "" && v !== undefined
      )
    );
    if (cleaned["endDateRes[lte]"]) {
      cleaned["endDateRes[lte]"] = addOneDay(cleaned["endDateRes[lte]"]);
    }
    return cleaned;
  }, [debouncedFilters]);

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const { data, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}gradesManagment/event/${id}`,
    queryKey: ["AllFees", queryFilters],
    params: queryFilters
  });

  const pageSize = Number(filterValues.limit) || 10;

  const filters = [
    {
      name: "limit",
      label: t("filters.limit"),
      type: "select",
      options: [
        { value: "10", label: "10" },
        { value: "20", label: "20" },
        { value: "30", label: "30" },
        { value: "50", label: "50" },
      ],
      placeholder: t("filters.select"),
    },
    {
      name: lang === "ar" ? "Student.fullName[contains]" : "Student.NameEn[contains]",
      label: t("filters.name"),
      type: "text",
    },
    { name: "exam.course.name[contains]", label: t("filters.examName"), type: "text" },
    { name: "Student.nationalId[contains]", label: t("filters.nationalId"), type: "text" },
    { name: "exam.date[date]", label: t("filters.date"), type: "date" },
    {
      name: "reservationStatus[contains]",
      label: t("filters.status"),
      type: "select",
      options: [
        { value: "failed", label: t("status.failed") },
        { value: "succeeded", label: t("status.succeeded") },
        { value: "absent", label: t("status.absent") },
      ],
      placeholder: t("filters.select"),
    },
  ];

  const columns = [
    {
      key: "name",
      label: t("columns.name"),
      render: row => lang === "ar" ? row.Student?.fullName : row.Student?.NameEn
    },
    {
      key: "nationalId",
      label: t("columns.nationalId"),
      render: row => row.Student?.nationalId
    },
    {
      key: "courseName",
      label: t("columns.examName"),
      render: row => lang === "ar"
        ? splitLang(row.exam?.course?.name).ar ?? row.exam?.course?.name
        : splitLang(row.exam?.course?.name).en ?? row.exam?.course?.name
    },
    {
      key: "grade",
      label: t("columns.grade"),
      render: row => row.reservationStatus === 'absent'  ?'-' : row.result ?? t("columns.noResult")
    },
    {
      key: "status",
      label: t("columns.status"),
      render: row => t(`status.${row.reservationStatus}`) ?? row.reservationStatus
    },
    {
      key: "date",
      label: t("columns.date"),
      render: row => formatDateOnly(row.exam?.date)
    },
  ];

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>
      <div className={styles.tableContainer}>
        <DynamicFilters
          filters={filters}
          values={filterValues}
          onChange={handleChange}
          setFilters={setFilterValues}
        />

        {isLoading
          ? <SkeletonLoader rows={pageSize} />
          : <Table columns={columns} data={data?.data?.data || []} />
        }

        <Pagination
          total={data?.data?.pagination?.total || 0}
          currentPage={filterValues.page}
          setCurrentPage={(page) =>
            setFilterValues((prev) => ({ ...prev, page }))
          }
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}