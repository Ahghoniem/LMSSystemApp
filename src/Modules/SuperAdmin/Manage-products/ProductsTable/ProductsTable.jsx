import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../../Components/Paginator/Pagination";
import Table from "../../../../Components/Table/Table";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import styles from "./ProductsTable.module.css";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { useTranslation } from "react-i18next";
import DynamicFilters from "../../../../Components/Filters2";
import { useFetchData } from './../../../../Hooks/UseFetchData';
import { Decode_Token, getLang, getToken } from "../../../../Utils";

export default function ProductsTable() {
    const navigate = useNavigate();
    const tokenData=Decode_Token()
    const role =tokenData.role.toLowerCase()
    const { t } = useTranslation("ProductsTable");
    const token =getToken()
    const lang=getLang()
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

      const userTypeMap = {
        "1": "Teachers",
        "2": "masters",
        "3": "PHD",
        "4": "diploma",
    };
    

    const {data,isLoading}=useFetchData({
        baseUrl:`${API_BASE_URL}products`,
        queryKey:["products",queryFilters],
        params:queryFilters,
        options: { keepPreviousData: true },
        token
    })
    
    const handleChange = (name, value) => {
        setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
    };

    const columns = [
        {
            key: "name",
            label: t("products.arabicName"),
            render: (row) => lang === 'ar'?row.courseNameAr:row.courseNameEn
        },
        {
            key: "allowedUsers",
            label: t("products.allowedUsers"),
            render: (row) => {
                const users = row.allowedUserTypes || [];
            
                if (Array.isArray(users) && users.length > 0) {
                    return (
                        <div className={styles.allowedUsersContainer}>
                            {users.map((user, index) => (
                                <span key={index} className={styles.userBadge}>
                                    {t(userTypeMap[user.userType]) || user.userType}
                                </span>
                            ))}
                        </div>
                    );
                }
                return "-";
            }
        },
        {
            key: "numberOfCourses",
            label: t("products.numberOfCourses"),
            render: (row) => {
                return row.requirdCourses || 0;
            },
        },
        {
            key: "pricingForEgyptians",
            label: t("products.pricingForEgyptians"),
            render: (row) => lang === 'ar'?row.priceEgyptian + " جنيه مصرى":row.priceEgyptian + " EGP"
        },
        {
            key: "pricingForForeigners",
            label: t("products.pricingForForeigners"),
            render: (row) => lang === 'ar'?(row.currency?.code || "$") + row.priceOther :row.priceOther + " "+ (row.currency?.code || "$")
        },
    ];

    const filters = [
        {
            name: "limit",
            label: t("products.limit"),
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
            name: "courseName[contains]",
            grow: true,
            label: t("products.arabicName"),
            type: "text",
        },
        {
            name: "requirdCourses[gte]",
            label: t("products.numberOfCourses"),
            type: "text",
        },
    ];
    const pageSize = filterValues.limit;

    const handleRowClick = (product) => {
        navigate(`/${role}/product-details/${product.productId}`);
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
