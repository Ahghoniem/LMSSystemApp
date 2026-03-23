import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import { flattenEvents, getDuration, getLang, getToken, handleFileResponse, splitLang, to12Hour } from "../../../Utils";
import { API_BASE_URL } from "../../../Constants";
import { useFetchData } from "../../../Hooks/UseFetchData";
import SkeletonLoader from "../../../Components/Skeleton/SkeletonLoader";
import Table from "../../../Components/Table/Table";
import axiosInstance from "../../../Constants/axiosInstance";

export default function TrainingDetails() {
  const token = getToken();
  const lang = getLang();
  const { t } = useTranslation("TrainingDetails");

  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [materialsBySession, setMaterialsBySession] = useState([]);
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  const [sessionName,setSessionName]=useState("")

  const { data: events } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/sessionManagement/activeSessions`,
    queryKey: ["events"],
    token,
  });

  const data = events?.[0]?.training?.sessions || [];
  const flattenedEvents = flattenEvents(data);
  const isLoading = false;

  const openMaterialsModal = async (row) => {
    const sessionId = row?.sessionId ?? row?.id;
    if (!sessionId) return;
    setIsMaterialsOpen(true);
    document.body.classList.add("blurred");
    try {
      const res = await axiosInstance.get(
        `admin/sessionManagement/Session/${sessionId}/material`
      );
      setMaterialsBySession(res.data?.data?.data ?? []);
      setSessionName(row.name)
    } catch (err) {
      console.error(err);
      setMaterialsBySession([]);
    }
  };

  const closeMaterialsModal = () => {
    setIsMaterialsOpen(false);
    setMaterialsBySession([]);
    setDownloadAllLoading(false);
    document.body.classList.remove("blurred");
  };

  const handleDownloadMaterial = async (materialId, fileName) => {
    try {
      const res = await axiosInstance.get(
        `admin/sessionManagement/session-materials/download/${materialId}`,
        { responseType: "blob" }
      );
      handleFileResponse(res, fileName, true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadAll = async () => {
    if (materialsBySession.length === 0) return;
    setDownloadAllLoading(true);
    try {
      console.log(materialsBySession);
      
      const res = await axiosInstance.get(`admin/sessionManagement/sessions/${materialsBySession[0].sessionId}/materials/download`,
        { responseType: "blob" }
      )
      handleFileResponse(res,sessionName,false)
    } catch (error) {
      console.log(error);
      
    }
    finally{
      setDownloadAllLoading(false);
    }
  };

  const columns = [
    { key: "name", label: t("sessionName"),
      render:(row)=> lang === 'ar'? splitLang(row.name).ar || row.name :splitLang(row.name).en || row.name
     },
    { key: "type", label: t("startTime"), render: (row) => to12Hour(row.startTime) },
    { key: "registrationStartDate", label: t("endTime"), render: (row) => to12Hour(row.endTime) },
    { key: "registrationEndDate", label: t("duration"), render: (row) => getDuration(row.startTime, row.endTime, lang) },
    {
      key: "virtualLink",
      label: t("sessionLink"),
      render: (row) => (
        <a href={row.virtualLink} className={styles.link} target="_blank" rel="noreferrer">
          {row.virtualLink}
        </a>
      ),
    },
    {
      key: "content",
      label: t("contentColumn"),
      render: (row) => (
        row.materials.length>0 ? <button
        type="button"
        className={styles.btnAction}
        onClick={() => openMaterialsModal(row)}
      >
        {t("materials.view")}
      </button>:<p>-</p>
      ),
    },
  ];

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>
      <div className={styles.tableContainer}>
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <Table columns={columns} data={flattenedEvents || []} />
        )}
      </div>

      {isMaterialsOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>{t("materials.title")}</h3>
              <button type="button" className={styles.iconClose} onClick={closeMaterialsModal} aria-label="Close">
                &times;
              </button>
            </div>
            <div className={styles.materialList}>
              {materialsBySession.length === 0 ? (
                <p className={styles.emptyText}>{t("materials.empty")}</p>
              ) : (
                materialsBySession.map((material) => (
                  <div key={material.materialId} className={styles.materialItem}>
                    <div className={styles.materialInfo}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleDownloadMaterial(material.materialId, material.name)}
                        onKeyDown={(e) => e.key === "Enter" && handleDownloadMaterial(material.materialId, material.name)}
                        className={styles.materialTitle}
                      >
                        {material.name}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {materialsBySession.length > 0 && (
              <button
                type="button"
                className={styles.downloadAllBtn}
                onClick={handleDownloadAll}
                disabled={downloadAllLoading}
              >
                {downloadAllLoading ? (
                  <span className={styles.spinner} aria-hidden />
                ) : (
                  t("materials.downloadAll")
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
