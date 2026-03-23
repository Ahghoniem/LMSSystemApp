import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import Table from "../../../../Components/Table/Table";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { getLang, getToken, splitLang } from "../../../../Utils";
import styles from "./TrainingUsers.module.css";
import DynamicFilters from "../../../../Components/Filters2";
import { useDebounce } from "../../../../Hooks/useDebounce";
import Pagination from "../../../../Components/Paginator/Pagination";

export default function TrainingUsers() {
  const { t } = useTranslation("TrainingUsers");
  const lang = getLang();
  const [searchParams] = useSearchParams();
  const trainingId = searchParams.get("trainingId");
  const token = getToken();
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
    const debouncedFilters = useDebounce(filterValues, 500);
  
    const queryFilters = useMemo(() => {
      const cleaned = Object.fromEntries(
        Object.entries(debouncedFilters).filter(
          ([, v]) => v !== "" && v !== undefined
        )
      );
      return cleaned;
    }, [debouncedFilters]);

  const { data, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/usersManagment/Training/${trainingId}/Students`,
    queryKey: ["trainingUsers", trainingId,queryFilters],
    params:queryFilters,
    token,
    options: { enabled: Boolean(trainingId) },
  });

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
    { name: "Student.fullName[contains]", label: t("table.fullName"), type: "text" },
    { name: "Student.User.email[contains]", label: t("table.email"), type: "text" },
    { name: "Student.Mobile[contains]", label: t("table.phoneNumber"), type: "text" },
    { name: "Student.college[contains]", label: t("table.college"), type: "text" },
  ];

  const columns = [
    {
      key: "fullName",
      label: t("table.fullName"),
      render: (row) => (lang === "ar" ? row.fullName : row.NameEn),
    },
    { key: "email", label: t("table.email") },
    { key: "Mobile", label: t("table.phoneNumber") },
    {
      key: "college",
      label: t("table.college"),
      render: (row) =>
        lang === "ar" ? splitLang(row.college).ar : splitLang(row.college).en,
    },
  ];

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>{t("title")}</h1>
      </div>

      <div className={styles.tableContainer}>
         <DynamicFilters
            filters={filters}
            values={filterValues}
            onChange={handleChange}
            setFilters={setFilterValues}
        />
        {isLoading ? (
          <SkeletonLoader rows={5} />
        ) : (
          <Table columns={columns} data={data?.data?.data} />
        )}
        <Pagination
          total={data?.data?.pagination?.total || 0}
          currentPage={filterValues.page}
          setCurrentPage={(page) =>
            setFilterValues((prev) => ({ ...prev, page }))
            }
          pageSize={filterValues.limit}
          />
      </div>
    </div>
  );
}
