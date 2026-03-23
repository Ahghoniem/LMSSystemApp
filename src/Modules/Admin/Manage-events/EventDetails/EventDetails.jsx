/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./EventDetails.module.css";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../../Constants";
import {
  Decode_Token,
  formatDateOnly,
  getChangedItems,
  getErrorMessage,
  getLang,
  getNextDayForInput,
  getToken,
  handleFileResponse,
  splitLang,
} from "../../../../Utils";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "./../../../../Constants/axiosInstance";
import { useNavigate, useParams } from "react-router";
import HasPermission from "../../../../Components/Permissions/HasPermission";
import PageDetailsSkeleton from "../../../../Components/PageSkeleton/PageDetailsSkeleton";
import PageNotFound from "../../../../Components/PageDetailsNotFound/PageNotFound";

export default function EventDetails() {
  const { t } = useTranslation("eventDetail");
  const { id } = useParams();
  const navigate = useNavigate();
  const lang = getLang();
  const token = getToken();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
  const [users, setUsers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: eventData, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/eventManagement/${id}`,
    queryKey: ["eventData", users],
    token,
  });

  const { data: usersData } = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/Supervisor`,
    queryKey: ["users"],
    token,
  });

  const { data: trainersData } = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/`,
    queryKey: ["trainers"],
    token,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [baseEvent, setBaseEvent] = useState(null);
  const [editedExams, setEditedExams] = useState([]);
  const [editedTrainings, setEditedTrainings] = useState([]);

  useEffect(() => {
    if (eventData?.data) {
      const data = eventData.data;

      setBaseEvent({
        capacity: data.capacity,
        startDate: data.startDate,
        endDate: data.endDate,
        startDateRes: data.startDateRes,
        endDateRes: data.endDateRes,
        language: data.language,
        eventId: data.eventId,
        packageId: data.packageId,
        type: data.type,
        examId: data.examId,
      });

      setEditedExams(data.exams ?? []);
      setEditedTrainings(data.trainings ?? []);
    }
  }, [eventData?.data]);

  const handleEditClick = () => {
    if (!isEditing && eventData?.data) {
      const data = eventData.data;

      setBaseEvent({
        capacity: data.capacity,
        startDate: data.startDate,
        endDate: data.endDate,
        startDateRes: data.startDateRes,
        endDateRes: data.endDateRes,
        language: data.language,
        eventId: data.eventId,
        packageId: data.packageId,
        type: data.type,
        examId: data.examId,
      });

      setEditedExams(data.exams ?? []);
      setEditedTrainings(data.trainings ?? []);
    }

    setIsEditing((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    let newValue = value;

    if (type === "number") {
      newValue = value === "" ? "" : Number(value);
    }

    const keyMap = {
      registrationStartDate: "startDateRes",
      registrationEndDate: "endDateRes",
      StartDate: "startDate",
      EndDate: "endDate",
      capacity: "capacity",
      language: "language",
    };

    const mappedKey = keyMap[name];

    if (mappedKey) {
      setBaseEvent({
        ...baseEvent,
        [mappedKey]: newValue,
      });
    }
  };

  const handleExamCourseChange = (index, field, value) => {
    const updated = [...editedExams];
    updated[index] = {
      ...updated[index],
      [field === "name" ? "courseId" : field]: value,
    };
    setEditedExams(updated);
  };

  const handleCourseTrainerChange = (index, value) => {
    const updated = [...editedTrainings];
    updated[index] = {
      ...updated[index],
      trainerId: value,
    };
    setEditedTrainings(updated);
  };
  const isBaseChanged = useMemo(() => {
    if (!eventData?.data || !baseEvent) return false;

    return (
      baseEvent.capacity !== eventData.data.capacity ||
      baseEvent.language !== eventData.data.language ||
      baseEvent.startDate !== eventData.data.startDate ||
      baseEvent.endDate !== eventData.data.endDate ||
      baseEvent.startDateRes !== eventData.data.startDateRes ||
      baseEvent.endDateRes !== eventData.data.endDateRes
    );
  }, [baseEvent, eventData]);

  const isExamsChanged = useMemo(() => {
    return (
      JSON.stringify(editedExams) !==
      JSON.stringify(eventData?.data?.exams ?? [])
    );
  }, [editedExams, eventData]);

  const isTrainingsChanged = useMemo(() => {
    return (
      JSON.stringify(editedTrainings) !==
      JSON.stringify(eventData?.data?.trainings ?? [])
    );
  }, [editedTrainings, eventData]);

  const changedTrainings = useMemo(() => {
    return getChangedItems(eventData?.data?.trainings ?? [], editedTrainings);
  }, [editedTrainings, eventData]);

  const changedExams = useMemo(() => {
    return getChangedItems(eventData?.data?.exams ?? [], editedExams);
  }, [editedExams, eventData]);

  const handleSaveEdit = async () => {
    try {
      setLoading(true);

      if (isBaseChanged) {
        await axiosInstance.put(
          `admin/eventManagement/${baseEvent.eventId}`,
          baseEvent
        );
      }

      if (changedTrainings.length > 0 && baseEvent.type === "training") {
        for (const training of changedTrainings) {
          await axiosInstance.put(
            `admin/trainingManagement/${training.trainingId}`,
            training
          );
        }
      }
      if (changedExams.length > 0 && baseEvent.type === "exam") {
        console.log(changedExams);

        for (const exam of changedExams) {
          await axiosInstance.put(`admin/examManagment/${exam.examId}`, exam);
        }
      }

      toast.success(t("updateSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setIsEditing(false);
      setUsers((prev) => prev + 1);
    } catch (error) {
      toast.error(t("updateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.put(
        `admin/eventManagement/close/${eventData?.data?.eventId}`
      );
      console.log(res.data);
      setUsers(users + 1);
      toast.success(t("deleteSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(t("deleteError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
  };

  const isExamEvent = eventData?.data?.type === "exam";

  const handleOpenUploadModal = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => {
    if (!isUploading) {
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    }
  };
  const handleFileChange = (e) => setSelectedFile(e.target.files?.[0] || null);

  const handleUploadResults = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      setIsUploading(true);
      const res = await axiosInstance.post(
        `grades/upload/${eventData?.data?.eventId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(res.data);
      
      toast.success(t("updateSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.log(error.response);
      toast.error(getErrorMessage(error.response.data,lang), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 4000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  

  const handleViewResults = () => {
    navigate(`/${role}/exam-results/${eventData.data.eventId}`);
  };

  const handleDownloadRegistrantsFile = async () => {
    try {
      setIsDownloading(true);
      const res = await axiosInstance.get(
        `admin/generateStudentDataExcel/downloadSheet/${baseEvent.eventId}`,{
          responseType: "blob",
        }
      );
      handleFileResponse(res,splitLang(eventData?.data?.eventName).ar,false)
    } catch (error) {
      toast.error(t("downloadLinkUnavailable"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <PageDetailsSkeleton rows={8} sections={2} />;
  }
  if (!eventData?.data) {
    return (
      <PageNotFound
        title={t("eventNotFound")}
        message={t("eventNotFoundDescription")}
        buttonText={t("backToList")}
        onBack={() => navigate(`/${role}/manage-events`)}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("eventDetails")}</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.detailsGrid}>
          <div className={styles.detailRow}>
            <span className={styles.label}>{t("eventName")}:</span>
            <span className={styles.value}>
              {lang !== "ar"
                ? splitLang(eventData?.data?.eventName).en
                : splitLang(eventData?.data?.eventName).ar
                ? splitLang(eventData?.data?.eventName).ar
                : eventData?.data?.eventName}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("type")}:</span>
            <span className={styles.value}>
              {eventData?.data?.type === "training" ? t("training") : t("exam")}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("eventLanguage")}:</span>
              <span className={styles.value}>
                {eventData?.data?.language === "EN"
                  ? t("languageEn")
                  : t("languageAr")}
              </span>
            
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("capacity")}:</span>
            {isEditing ? (
              <input
                type="number"
                name="capacity"
                min={1}
                value={baseEvent?.capacity ?? ""}
                onChange={handleInputChange}
                className={styles.editInput}
              />
            ) : (
              <span className={styles.value}>{eventData?.data.capacity}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("registeredCount")}:</span>
            <span className={styles.value}>
              {eventData?.data.numberOfRegistered}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("status")}:</span>
            <span className={styles.value}>{t(eventData?.data.status)}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("registrationStartDate")}:</span>
              <span className={styles.value}>
                {formatDateOnly(eventData?.data.startDateRes)}
              </span>
            
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("registrationEndDate")}:</span>
              <span className={styles.value}>
                {formatDateOnly(eventData?.data.endDateRes)}
              </span>
          </div>

          {editedTrainings.length > 0 && (
            <>
              <div className={styles.detailRow}>
                <span className={styles.label}>{t("StartDate")}:</span>
                  <span className={styles.value}>
                    {formatDateOnly(eventData?.data.startDate)}
                  </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>{t("EndDate")}:</span>
                  <span className={styles.value}>
                    {formatDateOnly(eventData?.data.endDate)}
                  </span>
              </div>
            </>
          )}

          {editedExams.length > 0 && (
            <div className={styles.packageExamSection}>
              {editedExams.map((exam, index) => (
                <React.Fragment key={index}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>
                      {t("examDate")}{" "}
                      {lang === "ar"
                        ? splitLang(exam.course.name).ar
                        : splitLang(exam.course.name).en}
                      :
                    </span>
                      <span className={styles.value}>
                        {formatDateOnly(exam.date)}
                      </span>
                    
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.label}>
                      {t("examPlace")}{" "}
                      {lang === "ar"
                        ? splitLang(exam.course.name).ar
                        : splitLang(exam.course.name).en}
                      :
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={exam.place}
                        onChange={(e) =>
                          handleExamCourseChange(index, "place", e.target.value)
                        }
                        className={styles.editInput}
                      />
                    ) : (
                      <span className={styles.value}>{exam.place}</span>
                    )}
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.label}>
                      {t("examSupervisor")}{" "}
                      {lang === "ar"
                        ? splitLang(exam.course.name).ar
                        : splitLang(exam.course.name).en}
                      :
                    </span>
                    {isEditing ? (
                      <select
                        value={exam.supervisorId}
                        onChange={(e) =>
                          handleExamCourseChange(
                            index,
                            "supervisorId",
                            e.target.value
                          )
                        }
                        className={styles.editInput}
                      >
                        <option value="">{t("selectLanguage")}</option>
                        {usersData?.data?.data?.map((item) => (
                          <option key={item.userId} value={item.userId}>
                            {lang === "ar" && splitLang(item.Name).ar
                              ? splitLang(item.Name).ar
                              : splitLang(item.Name).en}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.value}>
                        {lang === "ar"
                          ? splitLang(exam?.supervisor?.Name).ar ??
                            exam?.supervisor?.Name
                          : splitLang(exam?.supervisor?.Name).en ??
                            exam.supervisor.Name}
                      </span>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {editedTrainings.length > 0 && (
            <div className={styles.trainingPackageSection}>
              {editedTrainings.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>
                        {t("courseTrainer")} -{" "}
                        {lang === "ar"
                          ? splitLang(item.course.name).ar
                          : splitLang(item.course.name).en}
                        :
                      </span>
                      {isEditing ? (
                        <select
                          value={item.trainerId}
                          name="trainerId"
                          onChange={(e) =>
                            handleCourseTrainerChange(index, e.target.value)
                          }
                          className={styles.editInput}
                        >
                          <option value="">{t("select")}</option>
                          {trainersData?.data?.data?.map((tr) => (
                            <option
                              key={tr.User?.userId}
                              value={tr.User?.userId}
                            >
                              {lang === "ar"
                                ? splitLang(tr.Name).ar
                                : splitLang(tr.Name).en}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={styles.value}>
                          {lang === "ar"
                            ? splitLang(item.trainer.Name).ar
                            : splitLang(item.trainer.Name).en}
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  className={styles.editButton}
                  onClick={handleSaveEdit}
                  disabled={loading}
                >
                  <i className="fa-solid fa-check"></i>{" "}
                  {loading ? t("saving") : t("saveChanges")}
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  <i className="fa-solid fa-xmark"></i> {t("cancel")}
                </button>
              </>
            ) : (
              <>
                <HasPermission permission={"EDIT_EVENT"}>
                  {eventData?.data?.status !== "closed" && (
                    <button
                      className={styles.editButton}
                      onClick={handleEditClick}
                    >
                      <i className="fa-solid fa-pen-to-square"></i> {t("edit")}
                    </button>
                  )}
                </HasPermission>
                {isExamEvent && (
                  <>
                    <HasPermission permission={"UPLOAD_RESULTS"}>
                    <button
                      className={styles.secondaryButton}
                      onClick={handleOpenUploadModal}
                    >
                      {t("uploadResults")}
                    </button>
                    </HasPermission>
                   <HasPermission permission={"VIEW_RESULTS"}>
                   <button
                      className={styles.secondaryButton}
                      onClick={handleViewResults}
                    >
                      {t("viewResults")}
                    </button>
                   </HasPermission>
                    <HasPermission permission={"DOWNLOAD_TRAINEES_FILE"}>
                    <button
                      className={styles.secondaryButton}
                      onClick={handleDownloadRegistrantsFile}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <i className="fa-solid fa-list"></i>{" "}
                          {t("registrantsList")}
                        </>
                      )}
                    </button>
                    </HasPermission>
                  </>
                )}
                <HasPermission permission={"CLOSE_EVENT"}>
                  {eventData?.data?.status !== "closed" && (
                    <button
                      className={styles.deleteButton}
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      <i className="fa fa-times"></i>{" "}
                      {loading ? t("deleting") : t("delete")}
                    </button>
                  )}
                </HasPermission>
              </>
            )}
          </div>
          <button
            className={styles.backIcon}
            onClick={() => navigate(`/${role}/manage-events`)}
            title={t("backToList")}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className={styles.uploadOverlay}>
          <div className={styles.uploadModal}>
            <h2 className={styles.uploadTitle}>
              {t("uploadExamResultsTitle")}
            </h2>
            <p className={styles.uploadDescription}>
              {t("uploadExamResultsDescription")}
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className={styles.uploadInput}
            />
            {selectedFile && (
              <p className={styles.selectedFileName}>{selectedFile.name}</p>
            )}
            <div className={styles.uploadActions}>
              <button
                className={styles.uploadButton}
                onClick={handleUploadResults}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? t("uploading") : t("uploadButton")}
              </button>
              <button
                className={styles.cancelUploadButton}
                onClick={handleCloseUploadModal}
                disabled={isUploading}
              >
                {t("cancelUpload")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
