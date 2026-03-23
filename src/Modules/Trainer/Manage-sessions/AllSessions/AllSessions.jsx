import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./AllSessions.module.css";
import SessionDetails from "../SessionDetails/SessionDetails";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../../Constants";
import {
  getDuration,
  getLang,
  getToken,
  handleFileResponse,
  splitLang,
  to12Hour,
} from "../../../../Utils";
import axiosInstance from "../../../../Constants/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import { useTranslation } from "react-i18next";

const AllSessions = () => {
  const { t } = useTranslation("AllSessions");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trainingId = searchParams.get("trainingId");
  const token = getToken();
  const lang = getLang();
  const [qrLoadingMap, setQrLoadingMap] = useState({});
  const [saveLoading, setIsSaveLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [materialsSessionId, setMaterialsSessionId] = useState(null);
  const [materialsBySession, setMaterialsBySession] = useState([]);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);
  const [isMaterialLoading,setIsMaterialLoading]=useState(null)
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    file: null,
    fileName: "",
    url: "",
  });
  const [deleteMaterialId, setDeleteMaterialId] = useState(null);
  const [deleteSessionId, setDeleteSessionId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const { data: sessionsData, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/sessionManagement/`,
    queryKey: ["sessions", refreshKey],
    token,
  });

  const allSessions = sessionsData?.data?.data;

  const sessions = useMemo(() => {
    if (!trainingId) return allSessions;
    if (allSessions) {
      return allSessions.filter((session) => session.trainingId === trainingId);
    }
  }, [allSessions, trainingId]);

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleSaveSession = async (editedSession) => {
    try {
      await axiosInstance.put(
        `admin/sessionManagement/${selectedSession.sessionId}`,
        editedSession
      );

      toast.success(t("sessionUpdated"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });

      setRefreshKey((prev) => prev + 1);
      handleCloseModal();
    } catch (error) {
      console.log(error);
      toast.error(t("updateError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
  };

  const openQrPopup = async (session) => {
    const sessionId = session?.sessionId || session?.id || "unknown-session";
    try {
      setQrLoadingMap((prev) => ({ ...prev, [sessionId]: true }));
      const img = await axiosInstance.get(
        `admin/sessionManagement/sessionQR/${sessionId}`
      );
      setQrImage(img?.data?.data?.qr);
      setIsQrOpen(true);
      document.body.classList.add("blurred");
    } catch (error) {
      console.log(error);
    } finally {
      setQrLoadingMap((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const closeQrPopup = () => {
    setIsQrOpen(false);
    setQrImage(null);
    document.body.classList.remove("blurred");
  };

  const openMaterialsModal = async (session) => {
    const sessionId = session?.sessionId || session?.id || "unknown-session";
    setMaterialsSessionId(sessionId);
    try {
      setIsMaterialLoading(sessionId)
      const res = await axiosInstance.get(
        `admin/sessionManagement/Session/${sessionId}/material`
      );
      setIsMaterialsOpen(true);
      setMaterialsBySession(res.data?.data?.data);
      document.body.classList.add("blurred");
    } catch (error) {
      console.log(error);
      
    }finally{
      setIsMaterialLoading(null)
    }
  };

  const closeMaterialsModal = () => {
    setIsMaterialsOpen(false);
    setMaterialsSessionId(null);
    setIsMaterialFormOpen(false);
    setEditingMaterialId(null);
    setDeleteMaterialId(null);
    setMaterialForm({
      file: null,
      fileName: "",
      url: "",
    });
    document.body.classList.remove("blurred");
  };

  const openAddMaterial = () => {
    setEditingMaterialId(null);
    setMaterialForm({
      file: null,
      fileName: "",
      url: "",
    });
    setIsMaterialFormOpen(true);
  };

  const handleFileChange = (file) => {
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    setMaterialForm((prev) => ({
      ...prev,
      file,
      fileName: file.name,
      url: fileUrl,
    }));
  };

  const handleSaveMaterial = async () => {
    if (!materialForm.file) {
      toast.error(t("materials.uploadRequired"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
      return;
    }
    const formData = new FormData();
    formData.append("materials", materialForm.file);

    try {
      setIsSaveLoading(true);
      const res = await axiosInstance.post(
        `admin/sessionManagement/sessions/${materialsSessionId}/material`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newMaterial = res.data?.data[0];
      setMaterialsBySession((prev) => [...prev, newMaterial]);
      toast.success(t("materials.addSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setIsMaterialFormOpen(false);
      setEditingMaterialId(null);
      setMaterialForm({ file: null, fileName: "", url: "" });
    } catch (error) {
      console.log(error);
      toast.error(t("materials.addError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    } finally {
      setIsSaveLoading(false);
    }
  };

  const confirmDeleteMaterial = (materialId) => {
    setDeleteMaterialId(materialId);
  };

  const handleDeleteMaterial = async () => {
    try {
      await axiosInstance.delete(
        `admin/sessionManagement/sessions/${deleteMaterialId}/material`
      );
      setMaterialsBySession((prev) =>
        prev.filter((material) => material.materialId !== deleteMaterialId)
      );

      setDeleteMaterialId(null);
      toast.success(t("materials.deleteSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
    } catch (error) {
      console.log(error);
      toast.error(t("materials.deleteError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
  };

  const confirmDeleteSession = (sessionId) => {
    setDeleteSessionId(sessionId);
  };

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return;

    try {
      setDeleteLoading(deleteSessionId);
      await axiosInstance.delete(`admin/sessionManagement/${deleteSessionId}`);
      toast.success(t("sessionDeleted"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });

      setRefreshKey((prev) => prev + 1);
      setDeleteSessionId(null);
      setDeleteLoading(null);
    } catch (error) {
      console.log(error);
      toast.error(t("deleteError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
      setDeleteLoading(null);
    }
  };

  const handleDownloadMaterial = async (materialId, fileName) => {
    try {
      const res = await axiosInstance.get(
        `admin/sessionManagement/session-materials/download/${materialId}`,
        {
          responseType: "blob",
        }
      );
      handleFileResponse(res, fileName, true);
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className={styles.app}>
      <Toaster />
      <main className={styles.content}>
        <div className={styles.container}>
          <div className={styles.timelineHeader}>
            {trainingId && (
              <button
                className={styles.backBtn}
                onClick={() => navigate("/trainer/manage-trainings")}
              >
                <i className="fa-solid fa-arrow-right"></i>
                <span className={styles.backBtnText}>
                  {t("backToTrainings")}
                </span>
              </button>
            )}

            <h2 className={styles.timelineTitle}>
              {trainingId ? t("trainingSessions") : t("allSessions")}
            </h2>

            <button
              className={styles.addSessionBtn}
              onClick={() =>
                navigate(
                  trainingId
                    ? `/trainer/add-session?trainingId=${trainingId}`
                    : "/trainer/add-session"
                )
              }
            >
              {t("addSession")}
            </button>
          </div>

          {isLoading ? (
            <SkeletonLoader rows={5} />
          ) : sessions?.length === 0 || !sessions ? (
            <div className={styles.emptyState}>
              <p>{t("noSessions")}</p>
            </div>
          ) : (
            <div className={styles.timelineLine}>
              {sessions?.map((session, index) => (
                <div
                  key={session.sessionId || index}
                  className={styles.timelineItem}
                >
                  <div className={styles.timelineDate}>{session.date}</div>

                  <div className={styles.timelineDot}></div>

                  <div className={styles.timelineContent}>
                    <p className={styles.sessionCourse}>
                      {lang === "ar"
                        ? splitLang(session.name)?.ar || session.name
                        : splitLang(session.name)?.en || session.name}
                    </p>

                    <p className={styles.sessionTime}>
                      <i className="fa-regular fa-clock"></i>{" "}
                      {to12Hour(session.startTime, lang)} -{" "}
                      {to12Hour(session.endTime, lang)}
                    </p>

                    <p className={styles.sessionDuration}>
                      {t("duration")}:{" "}
                      {getDuration(session.startTime, session.endTime, lang)}
                    </p>

                    <div className={styles.sessionActions}>
                      <button
                        className={`${styles.sessionBtn} ${styles.btnDelete}`}
                        onClick={() => confirmDeleteSession(session.sessionId)}
                        disabled={deleteLoading === session.sessionId}
                      >
                        {deleteLoading === session.sessionId
                          ? t("deleting")
                          : t("delete")}
                      </button>

                      <button
                        className={`${styles.sessionBtn} ${styles.btnView}`}
                        onClick={() => handleViewDetails(session)}
                      >
                        {t("viewDetails")}
                      </button>

                      <button
                        className={`${styles.sessionBtn} ${styles.btnMaterials}`}
                        onClick={() => openMaterialsModal(session)}
                        disabled={isMaterialLoading === session.sessionId}
                      >
                        {isMaterialLoading === session.sessionId ? 
                        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />:
                        t("trainingMaterials")
                        }
                      </button>

                      <button
                        className={`${styles.sessionBtn} ${styles.btnAttendance}`}
                        onClick={() =>
                          navigate(
                            `/trainer/session-attendance?sessionId=${session.sessionId}`
                          )
                        }
                      >
                        {t("attendanceDetails")}
                      </button>

                      <button
                        disabled={qrLoadingMap[session.sessionId]}
                        className={`${styles.sessionBtn} ${styles.btnQr}`}
                        onClick={() => openQrPopup(session)}
                      >
                        {qrLoadingMap[session.sessionId] ? (
                          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          t("qrCode")
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isQrOpen && (
        <div className={styles.qrPopup}>
          <div className={styles.qrBox}>
            <span className={styles.close} onClick={closeQrPopup}>
              &times;
            </span>
            <img src={qrImage} alt="QR Code" />
          </div>
        </div>
      )}

      {isMaterialsOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>{t("materials.title")}</h3>
              <button
                className={styles.iconClose}
                onClick={closeMaterialsModal}
              >
                &times;
              </button>
            </div>

            <div className={styles.materialList}>
              {materialsBySession.length === 0 ? (
                <p className={styles.emptyText}>{t("materials.empty")}</p>
              ) : (
                materialsBySession.map((material) => (
                  <div
                    key={material.materialId}
                    className={styles.materialItem}
                  >
                    <div className={styles.materialInfo}>
                      <div>
                        <div
                          onClick={() =>
                            handleDownloadMaterial(
                              material.materialId,
                              material.name
                            )
                          }
                          className={styles.materialTitle}
                        >
                          {material.name}
                        </div>
                      </div>
                    </div>
                    <div className={styles.materialActions}>
                      <button
                        className={styles.textBtnDanger}
                        onClick={() =>
                          confirmDeleteMaterial(material.materialId)
                        }
                      >
                        {t("materials.delete")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className={styles.addMaterialBtn} onClick={openAddMaterial}>
              {t("materials.add")}
            </button>
          </div>
        </div>
      )}

      {isMaterialFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBoxSmall}>
            <div className={styles.modalHeader}>
              <h3>
                {editingMaterialId ? t("materials.edit") : t("materials.add")}
              </h3>
              <button
                className={styles.iconClose}
                onClick={() => setIsMaterialFormOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>{t("materials.uploadFile")}</label>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
              {materialForm.fileName && (
                <div className={styles.fileName}>{materialForm.fileName}</div>
              )}
            </div>

            <button
              className={styles.primaryBtn}
              disabled={saveLoading}
              onClick={handleSaveMaterial}
            >
              {saveLoading ? (
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                t("materials.save")
              )}
            </button>
          </div>
        </div>
      )}

      {deleteMaterialId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBoxSmall}>
            <div className={styles.modalHeader}>
              <h3>{t("materials.deleteConfirmTitle")}</h3>
              <button
                className={styles.iconClose}
                onClick={() => setDeleteMaterialId(null)}
              >
                &times;
              </button>
            </div>
            <p className={styles.confirmText}>
              {t("materials.deleteConfirmText")}
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.textBtn}
                onClick={() => setDeleteMaterialId(null)}
              >
                {t("materials.cancel")}
              </button>
              <button
                className={styles.dangerBtn}
                onClick={handleDeleteMaterial}
              >
                {t("materials.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSessionId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBoxSmall}>
            <div className={styles.modalHeader}>
              <h3>{t("deleteSessionTitle")}</h3>
              <button
                className={styles.iconClose}
                onClick={() => setDeleteSessionId(null)}
              >
                &times;
              </button>
            </div>
            <p className={styles.confirmText}>{t("confirmDelete")}</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.textBtn}
                onClick={() => setDeleteSessionId(null)}
              >
                {t("materials.cancel")}
              </button>
              <button
                className={styles.dangerBtn}
                onClick={handleDeleteSession}
                disabled={deleteLoading === deleteSessionId}
              >
                {deleteLoading === deleteSessionId
                  ? t("deleting")
                  : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <SessionDetails
          session={selectedSession}
          onClose={handleCloseModal}
          onSave={handleSaveSession}
        />
      )}
    </div>
  );
};

export default AllSessions;
