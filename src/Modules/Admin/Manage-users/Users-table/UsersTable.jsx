import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import DynamicFilters from "../../../../Components/Filters2";
import Pagination from "../../../../Components/Paginator/Pagination";
import ReportCard from "../../../../Components/Report/ReportCard";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import Table from "../../../../Components/Table/Table";
import {
  CollageSearch,
  uniSearch,
} from "../../Manage-rejected-users/StudentsTable/SearchOptions";
import {
  addOneDay,
  Decode_Token,
  formatDateOnly,
  getLang,
  getToken,
  splitLang,
} from "../../../../Utils";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import styles from "./UsersTable.module.css";

export default function AllStudentsTable() {
  const { t } = useTranslation("AllUsers");
  const token = getToken();
  const navigate = useNavigate();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
  const lang = getLang();

  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const debouncedFilters = useDebounce(filterValues, 500);

  const queryFilters = useMemo(() => {
    const cleaned = Object.fromEntries(
      Object.entries(debouncedFilters).filter(
        ([, v]) => v !== "" && v !== undefined
      )
    );
    if (cleaned["createdAt[lte]"]) {
      cleaned["createdAt[lte]"] = addOneDay(cleaned["createdAt[lte]"]);
    }
    return cleaned;
  }, [debouncedFilters]);

  const selectedStatus = debouncedFilters["status[contains]"];
  const statusParam = selectedStatus ? selectedStatus : "!pending";

  const baseUrl = `${API_BASE_URL}admin/usersManagment/byStatus/${statusParam}`;


  const { data, isLoading } = useFetchData({
    baseUrl: baseUrl,
    queryKey: ["ApprovedUsers", queryFilters],
    params: queryFilters,
    token,
    options: { keepPreviousData: true },
  });

  const { data: universities } = useFetchData({
    baseUrl: `${API_BASE_URL}universities`,
    queryKey: ["unis"],
    params: { limit: 100 },
  });

  const { data: colleges } = useFetchData({
    baseUrl: `${API_BASE_URL}colleges`,
    queryKey: ["colls"],
    params: { limit: 100 },
  });

  const pageSize = filterValues.limit;

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
    { name: "fullName[contains]", label: t("table.fullName"), type: "text" },
    { name: "nationalId[contains]", label: t("table.nationalId"), type: "text" },
    {
      name: "status[contains]",
      label: t("table.status"),
      type: "select",
      options: [
        { value: "approved", label: t("approved") },
        { value: "pending", label: t("pending") },
        { value: "reserved Training", label: t("reserved training") },
        { value: "reserved exam", label: t("reserved exam") },
      ],
      placeholder: t("select"),
    },
    {
      name: "university[contains]",
      label: t("table.university"),
      type: "select",
      options: uniSearch(universities),
      placeholder: t("select"),
    },
    {
      name: "college[contains]",
      label: t("table.college"),
      type: "select",
      options: CollageSearch(colleges),
      placeholder: t("select"),
    },
    { name: "createdAt[gte]", label: t("startDate"), type: "date" },
    { name: "createdAt[lte]", label: t("endDate"), type: "date" },
  ];

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value ,page:1}));
  };

  const columns = [
    { key: lang === "ar" ? "fullName" : "NameEn", label: t("table.fullName") },
    { key: "nationalId", label: t("table.nationalId") },
    {
      key: "university",
      label: t("table.university"),
      render: (row) =>
        lang === "ar"
          ? splitLang(row.university).ar ?? row.university
          : splitLang(row.university).en ?? row.university,
    },
    {
      key: "college",
      label: t("table.college"),
      render: (row) =>
        lang === "ar"
          ? splitLang(row.college).ar ?? row.college
          : splitLang(row.college).en ?? row.college,
    },
    { key: "department", label: t("table.department") },
    {
      key: "status",
      label: t("table.status"),
      render: (row) => row.status === "failed" ? t("reserved exam"):t(row.status.toLowerCase()),
    },
    {
      key: "createdAt",
      label: t("table.createdAt"),
      render: (row) => formatDateOnly(row.createdAt),
    },
  ];

  const handleRowClick = (student) => {
    navigate(`/${role}/edit-user`, { state: { student } });


  };

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
  );
}