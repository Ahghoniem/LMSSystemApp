import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Pagination from "../../../Components/Paginator/Pagination";
import Table from "../../../Components/Table/Table";
import SkeletonLoader from "../../../Components/Skeleton/SkeletonLoader";
import styles from "./CoursesTable.module.css";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../Constants";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { Decode_Token, getLang, getToken, splitLang } from "../../../Utils";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../Hooks/useDebounce";
import DynamicFilters from "../../../Components/Filters2";

export default function CoursesTable() {
  const { t } = useTranslation("CoursesTable");
  const navigate = useNavigate();
  const token = getToken();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
  const lang =getLang()
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

  const { data: coursesData, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}courses/`,
    queryKey: ["courses", queryFilters],
    params: queryFilters,
    token,
    options: { keepPreviousData: true },
  });

  const rawData = coursesData?.data?.data;

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const pageSize = filterValues.limit;
  

  const handleRowClick = (course) => {
    const courseId = course.courseId || course.id || course.course_id;
    navigate(`/${role}/course-details/${courseId}`);
  };

  const columns = [
    {
      key: "courseName_en",
      label: t("courseNameEn"),
      render: (row) => {
        const courseName =
          row.courseName ||
          row.name ||
          row.course_name ||
          row.courseName_en ||
          "";
        if (!courseName) return "-";
        const split = splitLang(courseName);
        return lang === 'ar' ? split.ar || '-' : split.en || '-';
      },
    },
    {
      key:"title",
      label:t("courseTitle"),
      render:row=>row.title?row.title:'-'
    },
    {
      key: "pricingForEgyptians",
      label: t("pricingForEgyptians"),
      render: (row) =>
        lang === "ar"
          ? row.priceEgyptian + " جنيه مصرى"
          : row.priceEgyptian + " EGP",
    },
    {
      key: "pricingForForeigners",
      label: t("pricingForForeigners"),
      render: (row) =>
        lang === "ar"
          ? (row.currency?.code || "$") + row.priceOther
          : row.priceOther + " " + (row.currency?.code || "$"),
    },
  ];

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
      name: "name[contains]",
      label: t("searchByName"),
      type: "text",
      placeholder: t("searchPlaceholder"),
    },
  ];

  return (
    <div className={styles.app}>
      <main className={styles.content}>
        <div className={styles.container}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>{t("coursesManagement")}</h1>
          </div>
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
                  data={rawData || []}
                  currentPage={filterValues.page}
                  pageSize={pageSize}
                  onRowClicked={handleRowClick}
                />

                <Pagination
                  total={
                    coursesData?.data?.pagination?.total ||
                    coursesData?.pagination?.total ||
                    0
                  }
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
      </main>
    </div>
  );
}
