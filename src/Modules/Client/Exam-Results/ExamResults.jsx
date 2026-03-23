import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Download } from "lucide-react";
import Table from "../../../Components/Table/Table";
import Pagination from "../../../Components/Paginator/Pagination";
import {
  Decode_Token,
  formatDateOnly,
  getLang,
  splitLang,
} from "../../../Utils";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../Constants";
import styles from "./ExamResults.module.css";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { useNavigate } from "react-router";
import axiosInstance from "../../../Constants/axiosInstance";
import SkeletonLoader from "../../../Components/Skeleton/SkeletonLoader";


export default function ExamResults() {
  const { t } = useTranslation("ExamResults");
  const lang = getLang();
  const navigate =useNavigate()
  const tokenData = Decode_Token();
  const [loadingRe, setLoadingRe] = useState(null); 
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const [isloading ,setIsloading]=useState(false)

  const { data,isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}gradesManagment/${tokenData.id}`,
    queryKey: ["UserResult",filterValues],
    params:filterValues
  });
  const results = data?.data?.data?.formattedRows|| [];
  console.log(data?.data?.data);
  
  
  const allPassed =tokenData.status === "succeeded"
  const overallStatus = allPassed ? "succeeded" : "failed";

  const handleRetakeExam = async(row) => {
    try {
      setLoadingRe(row.exam?.examId);
      const res = await axiosInstance.post(`admin/examManagment/Reexam/${row.exam.examId}`)
      console.log(res.data);
      navigate("/pay-fees",{state:{type:"exam"}})
    } catch (error) {
      console.log(error);
      
    }finally{
      setLoadingRe(null);
    }
  };
  

  const columns = [
    {
      key: "name",
      label: t("table.name"),
      render: (row) =>
        lang === "ar"
          ? splitLang(row.exam?.course?.name).ar ?? row.exam?.course?.name
          : splitLang(row.exam?.course?.name).en ?? row.exam?.course?.name,
    },
    {
      key: "date",
      label: t("table.date"),
      render: (row) => formatDateOnly(row.exam?.date),
    },
    {
      key: "status",
      label: t("table.status"),
      render: (row) => (
        <span
          className={
            row.reservationStatus === "succeeded"
              ? styles.passed
              : styles.failed
          }
        >
          {t(`status.${row.reservationStatus}`)}
        </span>
      ),
    },
    {
      key:"result",
      label:t("result"),
      render:row=>row.result?row.result : '-'
    },
    {
      key: "procedure",
      label: t("table.procedure"),
      render: (row) => {
        const isLoading = loadingRe === row.exam?.examId;
    
        return (
          <div className={styles.procedureButtons}>
            {(row.reservationStatus === "failed" ||
              row.reservationStatus === "absent") &&
            !row.hasPaidReexam ? (
              <button
                className={styles.retakeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetakeExam(row);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  t("retakeExam")
                )}
              </button>
            ) : (
              <p>-</p>
            )}
          </div>
        );
      },
    }
  ];

  const handleDownloadCertificate = async() => {
    try {
      setIsloading(true)
      await axiosInstance.post("admin/efada")
      navigate("/pay-fees")
    } catch (error) {
      console.log(error);
      
    }finally{
      setIsloading(false)
    }
  };

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>

      <div
        className={`${styles.summaryCard} ${
          overallStatus === "succeeded"
            ? styles.summaryCardPassed
            : styles.summaryCardFailed
        }`}
      >
        <div className={styles.summaryCardAccent} aria-hidden />
        <div className={styles.summaryCardContent}>
          <div
            className={
              overallStatus === "succeeded"
                ? styles.summaryIconWrapPassed
                : styles.summaryIconWrapFailed
            }
          >
            {overallStatus === "succeeded" ? (
              <CheckCircle2 size={28} strokeWidth={2.2} />
            ) : (
              <XCircle size={28} strokeWidth={2.2} />
            )}
          </div>
          <div className={styles.summaryCardBody}>
            <span className={styles.summaryLabel}>
              {t("summary.overallStatus")}
            </span>
            <span
              className={
                overallStatus === "succeeded"
                  ? styles.summaryStatusPassed
                  : styles.summaryStatusFailed
              }
            >
              {t(`status.${overallStatus}`)}
            </span>
            <p className={styles.summaryDescription}>
              {overallStatus === "succeeded"
                ? t("summary.passedAll")
                : t("summary.someFailed")}
            </p>
          </div>
          {allPassed && !data?.data?.data?.hasEfada && (
            <button
              type="button"
              className={styles.downloadCertificateBtn}
              onClick={handleDownloadCertificate}
              disabled={isloading}
            >
              {isloading ? <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />:
              <span>{t("requestCertificate")}</span>
              }
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        {isLoading? 
        <SkeletonLoader rows={filterValues.limit}/>:
        <Table
          columns={columns}
          data={results|| []}
          currentPage={filterValues.page}
          pageSize={filterValues.limit}
        />
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
    </div>
  );
}
