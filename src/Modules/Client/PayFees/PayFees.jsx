import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Table from "../../../Components/Table/Table";
import styles from "./PayFees.module.css";
import { Decode_Token, getLang, splitLang } from "../../../Utils";
import { useFetchData } from './../../../Hooks/UseFetchData';
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../Constants";
import { usePaymentRedirect } from "../../../Hooks/usePaymentRedirect";
import toast, { Toaster } from "react-hot-toast";
import SkeletonLoader from './../../../Components/Skeleton/SkeletonLoader';
import Pagination from "../../../Components/Paginator/Pagination";


export default function PayFees() {
  const { t } = useTranslation("PayFees");
  const lang =getLang()
  const tokenData=Decode_Token()

  const { submitPayment, loading,error } = usePaymentRedirect();
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);

  const {data , isLoading} =useFetchData({
    baseUrl:`${API_BASE_URL}pay/${tokenData.id}`,
    queryKey:["Userfees",filterValues],
    params:filterValues
  })
  
  

  useEffect(() => {
    if (!error) return;
  
    toast.error(
      <>
      <span>{t("errors.paymentFailedMessage")}</span>
    </>,{
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 5000,
      }
    );
  }, [error,t]);
  
  const handlePayment=async(id,paymentId) => {
    await submitPayment(`${API_BASE_URL}pay/pay/${paymentId}`,{
      email:tokenData.email,
      receiptIds:[id]
    })
  }

  

  const columns = [
    {
      key: "subjectName",
      label: t("columns.subjectName"),
      render: row => {
        const item = row.Product ?? row.Service; // choose Product if exists, otherwise Service
        if (!item) return ""; // fallback if neither exists
    
        const name = item.courseName ?? item.name; // fallback for naming differences
        const split = splitLang(name);
        
        return lang === 'ar' 
          ? split.ar ?? name 
          : split.en ?? name;
      }
    },
    { key: "amount", label: t("columns.amount"),
      render:row=> row.currency? row.amount + " "+row.currency?.code : lang === 'ar'? row.amount + "جنيه مصرى":row.amount + "EGP"
     },
    { key: "status", label: t("columns.status"),
      render:row=><p className={`${row.status === "PAID" ? 'text-green-700':row.status === "FAILED"? 'text-red-700':null}`}>{t(row.status)}</p>
     },
    {
      key: "actions",
      label: t("columns.actions"),
      render: (row) => (
        row.status === "PAID" ? '-' :
        <button type="button" disabled={loading} onClick={()=>handlePayment(row.receiptId,row.paymentId)} className={styles.btnPay}>
          {loading?t("redirect"):t("button.pay")}
        </button>
      ),
    },
  ];

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>
      <div className={styles.tableContainer}>
        {isLoading ? 
        <SkeletonLoader rows={5}/> :
        <Table columns={columns} data={data?.data?.data || []} />
        }
                <Pagination
                  total={data?.data?.pagination?.total || 0}
                  currentPage={filterValues.page}
                  pageSize={filterValues.limit}
                  showPageSize={true}
                  setCurrentPage={(page) =>
                    setFilterValues((prev) => ({ ...prev, page }))
                  }
                  setPageSize={(limit) =>
                    setFilterValues((prev) => ({
                      ...prev,
                      limit,
                      page: 1,
                    }))
                  }
                />
      </div>
      <Toaster/>
    </div>
  );
}
