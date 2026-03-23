import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Table from "../../../Components/Table/Table";
import {
  Decode_Token,
  formatDateOnly,
  getLang,
  splitLang,
} from "../../../Utils";
import styles from "./ExamDetails.module.css";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../Constants";
import SkeletonLoader from "../../../Components/Skeleton/SkeletonLoader";
import Pagination from "../../../Components/Paginator/Pagination";

export default function ExamDetails() {
  const { t } = useTranslation("ExamDetails");
  const lang = getLang();
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const tokenData = Decode_Token();

  const { data, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/usersManagment/Exam/${tokenData.id}`,
    queryKey: ["ExamDetailsForUser",filterValues],
    params:filterValues
  });

  const columns = [
    {
      key: "name",
      label: t("table.examName"),
      render: (row) =>
        lang === "ar"
          ? splitLang(row.course?.name).ar ?? row.course?.name
          : splitLang(row.course?.name).en,
    },
    {
      key: "date",
      label: t("table.examDate"),
      render: (row) => formatDateOnly(row.date),
    },
    {
      key: "location",
      label: t("table.examLocation"),
      render: (row) => row.place,
    },
  ];

  return (
    <div className={styles.content} dir={lang === "ar" ? "rtl" : "ltr"}>
      <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <SkeletonLoader rows={filterValues.limit} />
        ) : (
          <Table columns={columns} data={data?.data?.data || []} />
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
