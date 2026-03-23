import React, { useState, useEffect } from "react";
import styles from "./StudentDetailsModal.module.css";
import { ClipLoader } from "react-spinners";
import HasPermission from "../../../../Components/Permissions/HasPermission";

export default function StudentDetailsModal({
  isOpen,
  onClose,
  student,
  AcceptUser,
  t,
  loading,
  EditUser,
  editLoading
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNationalId, setEditedNationalId] = useState("");
  const [errors,setErrors]=useState({})
  const hasErrors = (errors) => Object.values(errors).some((error) => error);
  useEffect(() => {
    if (student?.nationalId) {
      setEditedNationalId(student.nationalId);
    }
  }, [student]);

  if (!isOpen) return null;

  const validateField=(value,name) => {
    let error=''
    const isEmpty = !value || /^\s+$/.test(value);
    if (isEmpty) error = t("errors.required");
    else if (!/^\d{14}$/.test(value))error = t("errors.invalid_id")
      setErrors({...errors,[name]:error})
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async() => {
    await EditUser(editedNationalId,student.userId)
    student.nationalId=editedNationalId
    setIsEditing(false)
  };
  const handleChange=(e) => {
    const {name , value} =e.target
    console.log(name);
    
    validateField(value,name)
    setEditedNationalId(value)
  }


  return (
    <div className={styles.modal} aria-hidden={!isOpen}>
      <div className={styles.modalDialog} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div className={styles.modalHead}>
          <h2 id="modalTitle" className={styles.modalTitle}>
            {t("studentDetails")}
          </h2>
          <button className={styles.modalClose} onClick={onClose} aria-label={t("close")}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.idCard}>
            <span className={styles.idBadge}>
              <i className="fa-regular fa-id-card-clip"></i> {t("idCardImage")}
            </span>
            <img
              className={styles.modalIdImage}
              src={student?.nationalIdImage || ""}
              alt={t("idCardImageAlt")}
            />
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.dt}>{t("name")}</div>
            <div className={styles.dd}>{student?.fullName || "—"}</div>

            <div className={styles.dt}>{t("nationality")}</div>
            <div className={styles.dd}>{student?.nationality || "—"}</div>

            <div className={styles.dt}>{t("nationalId")}</div>
            <div className={styles.dd}>
              {isEditing ? (
                <div className={styles.edit}>
                  <input
                  type="text"
                  name="editedNationalId"
                  className={styles.inputEdit}
                  value={editedNationalId}
                  onChange={handleChange}
                />
                {errors.editedNationalId && <span className={styles.error}>{errors.editedNationalId}</span>}
                </div>
              ) : (
                student?.nationalId || "—"
              )}
            </div>

            <div className={styles.dt}>{t("mobileNumber")}</div>
            <div className={styles.dd}>{student?.Mobile || "—"}</div>

            <div className={styles.dt}>{t("email")}</div>
            <div className={styles.dd}>{student?.User.email || "—"}</div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <HasPermission permission={"ACCEPT_USER"}>
          <button
            className={styles.btnAccept}
            disabled={loading}
            onClick={() => AcceptUser(student.userId)}
          >
            {!loading ? (
              <>
                <i className="fa-solid fa-check"></i> {t("accept")}
              </>
            ) : (
              <div className={styles.load}>
                <span>{t("loading")}</span>
                <ClipLoader size={18} color="#fff" />
              </div>
            )}
          </button>
          </HasPermission>

          {isEditing ? (
            <HasPermission permission={"EDIT_USER"}>
              <button className={styles.btnPrimary} disabled={hasErrors(errors) || editLoading} onClick={handleSaveClick}>
               {!editLoading ? (
              <>
                <i className="fa-solid fa-save"></i> {t("save")}
              </>
            ) : (
              <div className={styles.load}>
                <span>{t("loading")}</span>
                <ClipLoader size={18} color="#fff" />
              </div>
            )}
            </button>
            </HasPermission>
          ) : (
            <HasPermission permission={"EDIT_USER"}>
              <button className={styles.btnPrimary} onClick={handleEditClick}>
              <i className="fas fa-edit"></i> {t("edit")}
            </button>
            </HasPermission>
          )}
        </div>
      </div>
    </div>
  );
}
