import React, { useState } from "react";
import Table from "../../../../Components/Table/Table";
import styles from "../Users-table/UsersTable.module.css";
import { useParams } from "react-router";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { formatDateOnly, getLang, splitLang } from "../../../../Utils";
import { useTranslation } from "react-i18next";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import Pagination from "../../../../Components/Paginator/Pagination";

export default function UserGrades() {
  const { t } = useTranslation("AdminUserGrades");
  const lang = getLang();
  const { id } = useParams();
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);

  const { data, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}gradesManagment/${id}`,
    queryKey: ["UserGrades", filterValues],
    params: filterValues,
  });

  const columns = [
    {
      key: "name",
      label: t("table.name"),
      render: (row) =>
        lang === "ar"
          ? splitLang(row.exam?.course?.name).ar ?? row.exam?.course?.name
          : splitLang(row.exam?.course?.name).en ?? row.exam?.course?.name,
    },
    {
      key: "date",
      label: t("table.date"),
      render: (row) => formatDateOnly(row.exam?.date),
    },
    {
      key: "status",
      label: t("table.status"),
      render: (row) => (
        <span
          className={
            row.reservationStatus === "succeeded"
              ? styles.passed
              : styles.failed
          }
        >
          {t(`status.${row.reservationStatus}`)}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <SkeletonLoader rows={filterValues.limit} />
        ) : (
          <Table columns={columns} data={data?.data?.data?.formattedRows|| []} />
        )}

        <Pagination
          total={data?.data?.pagination?.total || 0}
          currentPage={filterValues.page}
          pageSize={filterValues.limit}
          showPageSize={true}
          setCurrentPage={(page) =>
            setFilterValues((prev) => ({ ...prev, page }))
          }
          setPageSize={(limit) =>
            setFilterValues((prev) => ({
              ...prev,
              limit,
              page: 1,
            }))
          }
        />
      </div>
    </div>
  );
}