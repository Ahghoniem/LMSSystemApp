import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../../Components/Paginator/Pagination";
import Table from "../../../Components/Table/Table";
import SkeletonLoader from "../../../Components/Skeleton/SkeletonLoader";
import DynamicFilters from "../../../Components/Filters2";
import styles from "./Certificate.module.css";
import pageStyles from "../Manage-users/index.module.css";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../Constants";
import {
  formatDateOnly,
  getLang,
  getToken,
  handleFileResponse,
} from "../../../Utils";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { useDebounce } from "../../../Hooks/useDebounce";
import axiosInstance from "../../../Constants/axiosInstance";
import HasPermission from "../../../Components/Permissions/HasPermission";

export default function Certificate() {
  const { t } = useTranslation("Certificate");
  const token = getToken();
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const lang = getLang();
  const [loading, setIsLoading] = useState(null);
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
    baseUrl: `${API_BASE_URL}admin/efada`,
    queryKey: ["benefitStatements", queryFilters],
    params: queryFilters,
    token,
    options: { keepPreviousData: true, retry: false },
  });
  const rawData = data?.data?.data || [];
  const keyMapping = {
    1: "Teachers",
    2: "masters",
    3: "PHD",
    4: "diploma",
  };

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const pageSize = Number(filterValues.limit) || 10;

  const handleDownload = async (row) => {
    try {
      setIsLoading(row.efadaId);
      const res = await axiosInstance.post(
        "admin/efada/efada",
        {
          nationalId: row.Student.nationalId,
          name: row.Student.fullName,
        },
        {
          responseType: "blob",
        }
      );
      handleFileResponse(res, "طلب افادة" + row.Student.fullName, true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: t("columns.name"),
      render: (row) =>
        lang === "ar" ? row.Student?.fullName : row.Student.NameEn,
    },
    {
      key: "nationalId",
      label: t("columns.nationalId"),
      render: (row) => row.Student?.nationalId ?? "-",
    },
    {
      key: "date",
      label: t("columns.date"),
      render: (row) => formatDateOnly(row.date) ?? "-",
    },
    {
      key: "packageName",
      label: t("columns.packageName"),
      render: (row) => t(keyMapping[row.Student?.type]) ?? "-",
    },

    {
      key: "actions",
      label: t("columns.actions"),
      render: (row) => {
        const isLoading = loading === row.efadaId;
        return (
          <HasPermission permission={"GENERATE_STATEMENTS"}>
            <div className={styles.actionsCell}>
              <button
                type="button"
                className={styles.downloadBtn}
                onClick={() => {
                  handleDownload(row);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  t("download")
                )}
              </button>
            </div>
          </HasPermission>
        );
      },
    },
  ];

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
      name:
        lang === "ar"
          ? "Student.fullName[contains]"
          : "Student.NameEn[contains]",
      label: t("columns.name"),
      type: "text",
      placeholder: t("filters.searchByName"),
    },
    {
      name: "Student.nationalId[contains]",
      label: t("columns.nationalId"),
      type: "text",
      placeholder: t("filters.searchByNationalId"),
    },
    {
      name: "date[date]",
      label: t("columns.date"),
      type: "date",
    },
    {
      name: "Student.type[in]",
      label: t("columns.packageName"),
      type: "select",
      placeholder: t("filters.searchByPackage"),
      options: [
        { value: "1", label: t("Teachers") },
        { value: "2", label: t("masters") },
        { value: "3", label: t("PHD") },
        { value: "4", label: t("diploma") },
      ],
    },
  ];

  return (
    <div className={pageStyles.page}>
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>
        </div>
        {/* <div className="flex justify-end relative -top-2">
         <button type="button" className={styles.downloadAllBtn}>
            {t("downloadAll")}
          </button>
         </div> */}
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
              <Table columns={columns} data={rawData} />
              <Pagination
                total={data?.data?.Pagination?.total || 0}
                currentPage={filterValues.page}
                setCurrentPage={(page) =>
                  setFilterValues((prev) => ({ ...prev, page }))
                }
                pageSize={pageSize}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
