import React, { useState } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import toast, { Toaster } from "react-hot-toast";
import styles from "./CourseDetails.module.css";
import Table from "../../../../Components/Table/Table";
import Popup from "../../../../Components/Popup/Popup";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import CourseEventDetails from "./CourseEventDetails";
import {
  Decode_Token,
  formatDateOnly,
  getLang,
  getToken,
  getTypeIcon,
  getTypeString,
  splitLang,
} from "../../../../Utils";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../../Constants";
import axiosInstance from "../../../../Constants/axiosInstance";

const Courses_Table = () => {
  const { t } = useTranslation("Courses_Table");
  const token = getToken();
  const [selectedRow, setSelectedRow] = useState(null);
  const data = Decode_Token(token);
  const [id, setId] = useState("");
  const { state } = useLocation();
  const type = state?.type || "training";
  const [isloading, setIsloading] = useState(false);
  const [pageState, setPageState] = useState(1);
  const { data: pro } = useFetchData({
    baseUrl: data?.productId ? `${API_BASE_URL}products/${data.productId}` : "",
    queryKey: ["pros", data?.productId],
    token,
    options: {
      enabled: !!data?.productId,
    },
  });

  const lang = getLang();
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    message: "",
    hasButtons: true,
  });
  const { data: res, isLoading: isloadingEvents } = useFetchData({
    baseUrl: `${API_BASE_URL}reservations/events`,
    queryKey: ["events", type, pageState],
    params: { type },
    token,
    options: {
      enabled: !!token,
    },
  });

  const handleReserve = (id) => {
    setId(id);
    setPopup({
      open: true,
      type: "warning",
      message: t("popupMessage"),
      hasButtons: true,
    });
  };
  
  const Action = async () => {
    if (type === "exam") {
      try {
        setIsloading(true);
        await axiosInstance.post("/reservations/register-exam",
          {
            eventId: id,
          }
        );
        toast.success(t("sucess"), {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
          duration: 2000,
        });
        setPopup({
          open: false,
          type: "warning",
          message: t("popupMessage"),
          hasButtons: true,
        });
        setPageState(pageState + 1);
      } catch (error) {
        console.error(error);
        toast.error(t("fail"), {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
          duration: 2000,
        });
        setPopup({
          open: false,
          type: "warning",
          message: t("popupMessage"),
          hasButtons: true,
        });
      } finally {
        setIsloading(false);
      }
    } else {
      try {
        setIsloading(true);
        await axiosInstance.post("/reservations/register-training",
          {
            eventId: id,
          }
        );
        toast.success(t("sucess"), {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
          duration: 2000,
        });
        setPopup({
          open: false,
          type: "warning",
          message: t("popupMessage"),
          hasButtons: true,
        });
        setPageState(pageState + 1);
      } catch (error) {
        console.error(error);
        toast.error(t("fail"), {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
          duration: 2000,
        });
        setPopup({
          open: false,
          type: "warning",
          message: t("popupMessage"),
          hasButtons: true,
        });
      } finally {
        setIsloading(false);
      }
    }
  };

  const columns = [
    {
      key: "eventName",
      label: t("courseName"),
      render: (row) => {
        const { en, ar } = splitLang(row?.eventName ?? "");
        return lang !== "ar" ? (en || row?.eventName) : (ar || row?.eventName);
      },
    },
    {
      key: "startDateRes",
      label: t("startDate"),
      render: (row) => formatDateOnly(row?.startDateRes),
    },
    {
      key: "endDateRes",
      label: t("endDate"),
      render: (row) => formatDateOnly(row?.endDateRes),
    },
    { key: "capacity", label: t("capacity") },
    { key: "numberOfRegistered", label: t("enrolled") },
    // {
    //   key: "trainerName",
    //   label: isExam ? t("superName") : t("trainerName"),
    //   render: (row) =>
    //     isGuest
    //       ? row.trainerName
    //       : isExam
    //       ? lang === "ar"
    //         ? splitLang(row?.exams[0]?.supervisor?.Name).ar ??
    //           row?.exams[0]?.supervisor?.Name
    //         : splitLang(row?.exams[0]?.supervisor?.Name).en ??
    //           row?.exams[0]?.supervisor?.Name ??
    //           "-"
    //       : row?.trainings[0]?.trainer?.Name || "-",
    // },
    {
      key: "",
      label: t("action"),
      render: (row) => (
        <button
          onClick={() => handleReserve(row.eventId)}
          className={styles.btnJoin}
        >
          {t("reserve")}
        </button>
      ),
    },
  ];

  const handleRowClick = (row) => {
    console.log(row);
    
    setSelectedRow(row);
  };

  const requiredCoursesCount = pro?.data?.requirdCourses || 1;

  return (
    <div className={styles.app}>
      <main className={styles.content}>
        <div className={`${styles.container} ${styles.detailsGrid}`}>
          {/* Hero Section */}
          <section className={styles.courseHero} aria-labelledby="course-title">
            <div className={styles.courseIdentity}>
              <div className={styles.courseLogo}>
              {getTypeIcon(type)}
              </div>
              <div className={styles.courseTitleWrap}>
                <h1 id="course-title">
                  {getTypeString(lang, type, requiredCoursesCount)}
                </h1>
                <p className={styles.courseBrief}>
                  {type === "exam" ? t("descExam") : t("descTrain")}
                </p>
              </div>
            </div>
          </section>

          {/* Slots Section */}
          <section
            id="slots"
            className={styles.courseSlots}
            aria-labelledby="slots-title"
          >
            <div className={styles.slotsHead}>
              <h2 id="slots-title">
                <i className="fa-regular fa-calendar-days"></i>{" "}
                {t("availableSlots")}
              </h2>
            </div>

            {isloadingEvents  ? (
              <SkeletonLoader rows={5} />
            ) : (
              <Table
                columns={columns}
                data={res?.data}
                onRowClicked={handleRowClick}
              />
            )}

            <Popup
              isOpen={popup.open}
              type={popup.type}
              message={popup.message}
              hasButtons={popup.hasButtons}
              to={"/"}
              warning={true}
              onClose={() => setPopup((p) => ({ ...p, open: false }))}
              action={Action}
              isloading={isloading}
            />
          </section>
        </div>
      </main>
      {selectedRow && (
        <div
          className={styles.detailsModalOverlay}
          onClick={(e) => e.target === e.currentTarget && setSelectedRow(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-details-title"
        >
          <div className={styles.detailsModalContent} onClick={(e) => e.stopPropagation()}>
            <CourseEventDetails
              row={selectedRow}
              type={type}
              onClose={() => setSelectedRow(null)}
              isModal
            />
          </div>
        </div>
      )}
      <Toaster/>
    </div>
  );
};

export default Courses_Table;
