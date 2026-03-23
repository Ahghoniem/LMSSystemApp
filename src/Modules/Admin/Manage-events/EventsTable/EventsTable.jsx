import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../../Components/Paginator/Pagination";
import Table from "../../../../Components/Table/Table";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import styles from "./EventsTable.module.css";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { addOneDay, Decode_Token, flattenEvents, formatDateOnly, getLang, getToken, splitLang } from "../../../../Utils";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { useTranslation } from "react-i18next";
import DynamicFilters from "../../../../Components/Filters2";
export default function EventsTable() {
    const navigate = useNavigate();
    const token = getToken();
    const tokenData=Decode_Token()
    const role =tokenData.role.toLowerCase()
    const lang=getLang()
    const { t } = useTranslation("EventsTable");
    const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
    const debouncedFilters = useDebounce(filterValues, 500);

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


    const {data:events}=useFetchData({
      baseUrl:`${API_BASE_URL}admin/eventManagement`,
      queryKey:["events",queryFilters],
      params: queryFilters,
      token,
      options: { keepPreviousData: true },
    }) 
    

    const data = events?.data?.data || [];
    const flattenedEvents = flattenEvents(data);
    const isLoading = false;
    const handleChange = (name, value) => {
      setFilterValues((prev) => ({ ...prev, [name]: value ,page:1}));
    };

    const pageSize = filterValues.limit;

    const columns = [
      {
        key: "title",
        label: t("events.title"), // اسم الفعالية
        render: (row) => {
          const localized =
            lang !== "ar"
              ? splitLang(row.eventName).en
              : splitLang(row.eventName).ar || row.eventName;
  
          return localized || "-";
        },
      },
  
      {
        key: "type",
        label: t("events.type"), // النوع
        render: (row) =>
          row.type === "training" ? t("events.training") : t("events.exam"),
      },
  
      {
        key: "registrationStartDate",
        label: t("events.registrationStartDate"), // تاريخ بدء التسجيل
        render: (row) => formatDateOnly(row.startDateRes),
      },
  
      {
        key: "registrationEndDate",
        label: t("events.registrationEndDate"), // تاريخ انتهاء التسجيل
        render: (row) => formatDateOnly(row.endDateRes),
      },
  
      {
        key: "capacity",
        label: t("events.capacity"), // السعة
      },
  
      {
        key: "numberOfRegistered",
        label: t("events.numberOfRegistered"), // عدد المسجلين
      },
  
      {
        key: "status",
        label: t("events.status"),
        render:row=>t(row.status)
      },
    ];
    const filters = [
      {
        name: "limit",
        label: t("events.limit"),
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
        { name: "eventName[contains]",grow:true, label: t("events.title"), type: "text" },
        {
          name: "status",
          label: t("events.status"),
          type: "select",
          options: [
            { value: "opend", label: t("opend") },
            { value: "closed", label: t("closed") },
          ],
          placeholder: t("select"),
        },
        {
          name: "type",
          label: t("events.type"),
          type: "select",
          options: [
            { value: "training", label: t("events.training") },
            { value: "exam", label: t("events.exam") },
          ],
          placeholder: t("select"),
        },
        { name: "startDateRes[gte]", label: t("events.registrationStartDate"), type: "date" },
        { name: "endDateRes[lte]", label: t("events.registrationEndDate"), type: "date" },
      ];

    const handleRowClick = (event) => {
      if (event.type === "training") {
        navigate(`/${role}/training-details/${event.eventId}`);
      } else if (event.type === "exam") {
        navigate(`/${role}/exam-details/${event.eventId}`);
      }
    };

    return (
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>إدارة الفعاليات</h1>
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
                data={flattenedEvents || []}
                currentPage={filterValues.page}
                pageSize={pageSize}
                onRowClicked={handleRowClick}
              />

              <Pagination
                total={events?.data?.pagination?.total || 0}
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
  
