import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../../../../Components/Paginator/Pagination";
import Table from "../../../../Components/Table/Table";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import styles from "./TeamTable.module.css";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import {
  Decode_Token,
  getLang,
  getToken,
  splitLang,
} from "../../../../Utils";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../../Hooks/useDebounce";
import DynamicFilters from "../../../../Components/Filters2";

export default function TeamTable() {
  const { t } = useTranslation("TeamTable");
  const navigate = useNavigate();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
  const lang=getLang()
  const token = getToken();
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const debouncedFilters = useDebounce(filterValues, 500);
  const { state } = useLocation();
  const type = state?.type;
  const queryFilters = useMemo(() => {
    const cleaned = Object.fromEntries(
      Object.entries(debouncedFilters).filter(
        ([, v]) => v !== "" && v !== undefined
      )
    );
    return cleaned;
  }, [debouncedFilters]);

  const { data: trainerData, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin`,
    queryKey: ["team", queryFilters],
    params: queryFilters,
    token,
    options: {enabled:type === "trainer" || type === "TRAINER" },
  });
  

  const { data: superData,isLoading:isloadingSuper } = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/Supervisor`,
    queryKey: ["team", queryFilters],
    params: queryFilters,
    token,
    options: { enabled:type === "super" || type === "SUPERVISOR" },
  });

  const { data: adminData,isLoading:isloadingAdmin} = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/Admin`,
    queryKey: ["team", queryFilters],
    params: queryFilters,
    token,
    options: { keepPreviousData: true,enabled:type === "Admin" || type === "ADMIN" },
  });


  const data = trainerData?.data?.data || superData?.data?.data || adminData?.data?.data  || [];
  const pageSize = filterValues.limit;

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const columns = [
    {
      key: "fullName",
      label: t("table.fullName"),
      render: (row) => {
        const name = row.Name;
        if (!name) return "-";
        const parts = splitLang(name);
        return parts?.[lang] || name;
      },
    },
    {
      key: "email",
      label: t("table.email"),
      render:row=> row.User.email
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
      name: "Name[contains]",
      label: t("table.fullName"),
      type: "text",
      placeholder: t("searchPlaceholder"),
    },
    {
      name: "User.email[contains]",
      label: t("table.email"),
      type: "text",
      placeholder: t("searchPlaceholder"),
    },
  ];

  const handleRowClick = (member) => {
    navigate(`/${role}/member-details`, { state: { member } });
  };

  return (
    <div className={styles.content}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>{
          type === "trainer" || type === "TRAINER"?t("pageTitleTrain"):
          type === "super" || type === "SUPERVISOR"?t("pageTitleSuper"):
          t("pageTitleAdmin")
          }</h1>
      </div>
      <div className={styles.tableContainer}>
        <DynamicFilters
          filters={filters}
          values={filterValues}
          onChange={handleChange}
          setFilters={setFilterValues}
        />

        {isLoading || isloadingAdmin || isloadingSuper ? (
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
              total={trainerData?.data?.pagination?.total ?? 0}
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

