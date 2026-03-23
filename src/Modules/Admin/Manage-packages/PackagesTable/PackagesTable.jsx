import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../../Components/Paginator/Pagination";
import Table from "../../../../Components/Table/Table";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import styles from "./PackagesTable.module.css";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { useTranslation } from "react-i18next";
import DynamicFilters from "../../../../Components/Filters2";
import { Decode_Token, getLang, getToken, splitLang } from "../../../../Utils";
import { useFetchData } from "../../../../Hooks/UseFetchData";

export default function PackagesTable() {
  const navigate = useNavigate();
  const { t } = useTranslation("PackagesTable");
  const lang = getLang();
  const token = getToken();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
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
    baseUrl: `${API_BASE_URL}admin/packagegManagement`,
    queryKey: ["packs", queryFilters],
    params: queryFilters,
    token,
  });

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const columns = [
    {
      key: "name",
      label: t("packages.name"),
      render: (row) => (lang === "ar" ? splitLang(row.packageName).ar : splitLang(row.packageName).en),
    },
    {
      key: "elements",
      label: t("packages.elements"),
      render: (row) => {
        const elements = row.courses || [];
        if (Array.isArray(elements) && elements.length > 0) {
          return (
            <div className={styles.elementsContainer}>
              {elements.map((element, index) => (
                <span key={index} className={styles.elementBadge}>
                  {lang === 'ar'? splitLang(element.name).ar:splitLang(element.name).en}
                </span>
              ))}
            </div>
          );
        }
        return "-";
      },
    },
    {
      key: "numberOfElements",
      label: t("packages.numberOfElements"),
      render: (row) => row.size || 0,
    },
    {
      key: "availableType",
      label: t("packages.availableType"),
      render: (row) => {
        const types = row.Products || [];
        if (Array.isArray(types) && types.length > 0) {
          return (
            <div className={styles.elementsContainer}>
              {types.map((type, index) => (
                <span
                  key={index}
                  className={styles.typeBadge}
                  data-type="standard"
                >
                  {lang === 'ar'? splitLang(type.courseName).ar:splitLang(type.courseName).en}
                </span>
              ))}
            </div>
          );
        }
        return "-";
      },
    },
  ];

  const filters = [
    {
      name: "limit",
      label: t("packages.limit"),
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
      name: "packageName[contains]",
      grow: true,
      label: t("packages.name"),
      type: "text",
    },
  ];

  const handleRowClick = (pkg) => {
    navigate(`/${role}/package-details/${pkg.packageId}`);
  };

  const pageSize = filterValues.limit;

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
        {isLoading ? (
          <SkeletonLoader rows={pageSize} />
        ) : (
          <Table
            columns={columns}
            data={data?.data?.data || []}
            currentPage={filterValues.page}
            pageSize={pageSize}
            onRowClicked={handleRowClick}
          />
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
