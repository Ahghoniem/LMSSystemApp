import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../../Components/Paginator/Pagination";
import Table from "../../../../Components/Table/Table";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import styles from "./ServicesTable.module.css";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { useTranslation } from "react-i18next";
import DynamicFilters from "../../../../Components/Filters2";
import { useFetchData } from "./../../../../Hooks/UseFetchData";
import { Decode_Token, getLang, getToken, splitLang } from "../../../../Utils";

export default function ServicesTable() {
    const navigate = useNavigate();
    const tokenData=Decode_Token()
    const role =tokenData.role.toLowerCase()
    const { t } = useTranslation("ServicesTable");
    const token = getToken();
    const lang = getLang();
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
        baseUrl: `${API_BASE_URL}services`,
        queryKey: ["services", queryFilters],
        params: queryFilters,
        options: { keepPreviousData: true },
        token,
    });

    const handleChange = (name, value) => {
        setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
    };

    const columns = [
        {
            key: "name",
            label: t("services.arabicName"),
            render: (row) =>
                lang === "ar" ? splitLang(row.name).ar ?? row.name:splitLang(row.name).en ?? row.name,
        },
        {
            key: "pricingForEgyptians",
            label: t("services.pricingForEgyptians"),
            render: (row) =>
                lang === "ar"
                    ? row.priceEgyptian + " جنيه مصرى"
                    : row.priceEgyptian + " EGP",
        },
        {
            key: "pricingForForeigners",
            label: t("services.pricingForForeigners"),
            render: (row) =>
                lang === "ar"
                    ? (row.currency || "$") + row.priceOther
                    : row.priceOther + " " + (row.currency || "$"),
        },
    ];

    const filters = [
        {
            name: "limit",
            label: t("services.limit"),
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
            grow: true,
            label: t("services.arabicName"),
            type: "text",
        },
    ];
    const pageSize = filterValues.limit;

    const handleRowClick = (service) => {
        navigate(`/${role}/service-details/${service.serviceId ?? service.productId ?? service.id}`);
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
