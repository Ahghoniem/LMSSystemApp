import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./PermissionFiles.module.css";
import Table from "../../../Components/Table/Table";
import DynamicFilters from "../../../Components/Filters2";
import Pagination from "../../../Components/Paginator/Pagination";
import SkeletonLoader from "../../../Components/Skeleton/SkeletonLoader";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../Constants";
import { useDebounce } from "../../../Hooks/useDebounce";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { formatDateOnly, getToken, splitLang } from "../../../Utils";

export default function PermissionFiles() {
  const { t } = useTranslation("viewPermissionFiles"); // Translation namespace
  const navigate = useNavigate();
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
    baseUrl: `${API_BASE_URL}Profile`,
    queryKey: ["files", queryFilters],
    params: queryFilters,
    token,
    options: { keepPreviousData: true },
  });

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleRowClick = (row) => {
    navigate(`/superadmin/edit-permission-file/${row.profileId}`);
  };

  const pageSize = filterValues.limit;

  const columns = [
    {
      key: "nameAr",
      label: t("nameAr"),
      render: (row) => splitLang(row.name).ar,
    },
    {
      key: "nameEn",
      label: t("nameEn"),
      render: (row) => splitLang(row.name).en,
    },
    {
      key: "createdAt",
      label: t("createdAt"),
      render: (row) => formatDateOnly(row.createdAt),
    },
  ];

  const filters = [
    {
      name: "limit",
      label: t("itemsPerPage"),
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
      label: t("search"),
      type: "text",
      placeholder: t("search"),
      grow: true,
    },
  ];

  return (
    <div className={styles.app}>
      <main className={styles.content}>
        <div className={styles.container}>
          <header className={styles.headerSection}>
            <div className={styles.headerContent}>
              <h1 className={styles.pageTitle}>{t("permissionFiles")}</h1>
              <p className={styles.description}>{t("managePermissionFilesDesc")}</p>
            </div>
          </header>

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
                  data={data?.data?.data || []}
                  currentPage={filterValues.page}
                  pageSize={pageSize}
                  onRowClicked={handleRowClick}
                />

                <Pagination
                  total={data?.data?.pagination?.total || 0}
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
