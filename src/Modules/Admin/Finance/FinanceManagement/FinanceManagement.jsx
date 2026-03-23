import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DynamicFilters from "../../../../Components/Filters2";
import Table from "../../../../Components/Table/Table";
import Pagination from "../../../../Components/Paginator/Pagination";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { useDebounce } from "../../../../Hooks/useDebounce";
import styles from "./FinanceManagement.module.css";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import { addOneDay, formatDateOnly, getLang, splitLang } from "../../../../Utils";


export default function FinanceManagement() {
  const { t } = useTranslation("FinanceManagement");
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const lang = getLang()
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

  const {data , isLoading}=useFetchData({
    baseUrl:`${API_BASE_URL}pay`,
    queryKey:["AllFees",queryFilters],
    params:queryFilters
  })
  

  const pageSize = Number(filterValues.limit) || 10;

  const filters = [
    {
      name: "limit",
      label: t("limit"),
      type: "select",
      options: [
        { value: "10", label: "10" },
        { value: "20", label: "20" },
        { value: "30", label: "30" },
        { value: "50", label: "50" },
      ],
      placeholder: t("select"),
    },
    { name: lang === 'ar' ? "Student.fullName[contains]":"Student.NameEn[contains]"
    , label: t("columns.name"), type: "text" },
    { name: "Product.courseName[contains]", label: t("columns.subjectName"), type: "text" },
    { name: "Student.nationalId[contains]", label: t("columns.nationalId"), type: "text" },
    { name: "timestamp[date]", label: t("columns.date"), type: "date" },
    {
      name: "status",
      label: t("columns.status"),
      type: "select",
      options: [
        { value: "PENDING", label: t("PENDING") },
        { value: "PAID", label: t("PAID") },
        { value: "FAILED", label: t("FAILED") },
      ],
      placeholder: t("select"),
    },
  ];



  const columns = [
    { key: "name", label: t("columns.name"),
      render:row=>lang === 'ar' ? row.Student?.fullName:row.Student?.NameEn
     },
    {
          key: "subjectName",
          label: t("columns.subjectName"),
          render: row => {
            const item = row.Product ?? row.Service;
            if (!item) return "";
            const name = item.courseName ?? item.name;
            const split = splitLang(name);
            
            return lang === 'ar' 
              ? split.ar ?? name 
              : split.en ?? name;
          }
        },
    { key: "nationalId", label: t("columns.nationalId"),
      render:row=> row.Student?.nationalId
     },
    { key: "actualAmount", label: t("columns.actualAmount"),
      render:row=>row.actualAmount ?? '-'
     },
    { key: "amount", label: t("columns.amount"),
      render:row=>row.amount ?? '-'
     },
    { key: "date", label: t("columns.date"),
      render:row=>formatDateOnly(row.timestamp)
     },
    { key: "status", label: t("columns.status"),
      render:row=>t(row.status)
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

        {isLoading ? 
        <SkeletonLoader rows={pageSize}/>:
        <Table columns={columns} data={data?.data?.data || []} />
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

