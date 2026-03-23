import React, { useState } from "react"
import styles from "./SessionDetails.module.css"
import { ClipLoader } from "react-spinners"
import { addMinutes, concatLang, splitLang } from "../../../../Utils"
import { useTranslation } from "react-i18next"

const SessionDetails = ({ session, onClose, onSave }) => {
  const { t } = useTranslation("SessionDetails")

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [editedSession, setEditedSession] = useState({
    name: splitLang(session?.name).ar? splitLang(session?.name).ar: session?.name,
    nameEn: splitLang(session?.name).en? splitLang(session?.name).en: "",
    date: session?.date || "",
    startTime: session?.startTime || "",
    endTime: session?.endTime || "",
    virtualLink: session?.virtualLink || "",
  })
  

  const [errors, setErrors] = useState({})
  const arabicRegex = /^[\u0600-\u06FF0-9\s]+$/;
  const englishRegex = /^[A-Za-z0-9\s]+$/;
  const validateField = (name, value) => {
    let error = ""
    const isEmpty = !value || /^\s+$/.test(value)
    if (isEmpty) error = t("validation.required")
      if (name === "name") {
        if (!value.trim()) error = t("validation.requiredArabicName");
        else if (!arabicRegex.test(value.trim()))
          error = t("validation.arabicOnly");
      }
      if (name === "nameEn") {
        if (!value.trim()) error = t("validation.requiredEnglishName");
        else if (!englishRegex.test(value.trim()))
          error = t("validation.englishOnly");
      }
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const hasErrors = (errors) =>
    Object.values(errors).some((error) => error);

  const handleChange = (e) => {
    const { name, value } = e.target
    validateField(name, value)
    setEditedSession((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    const newErrors = {}

    for (const [key, value] of Object.entries(editedSession)) {
      if (!value || /^\s+$/.test(value)) {
        newErrors[key] = t("validation.required")
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const formData={
      name:concatLang(editedSession.nameEn,editedSession.name),
      date:editedSession.date,
      startTime:editedSession.startTime,
      endTime:editedSession.endTime,
      virtualLink:editedSession.virtualLink
    }

    setLoading(true)
    await onSave(formData)
    setLoading(false)
    setIsEditing(false)
  }

  if (!session) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles.modalTitle}>{t("title")}</h2>

        <div className={styles.detailsContainer}>
          {isEditing ? (
            <>
              <div className={styles.detailItem}>
                <label className={styles.label}>
                  {t("fields.name")}:
                </label>
                <input
                  type="text"
                  name="name"
                  value={editedSession.name}
                  onChange={handleChange}
                  className={styles.input}
                />
                {errors.name && (
                  <span className={styles.error}>{errors.name}</span>
                )}
              </div>
              <div className={styles.detailItem}>
                <label className={styles.label}>
                  {t("fields.nameEn")}:
                </label>
                <input
                  type="text"
                  name="nameEn"
                  value={editedSession.nameEn}
                  onChange={handleChange}
                  className={styles.input}
                />
                {errors.nameEn && (
                  <span className={styles.error}>{errors.nameEn}</span>
                )}
              </div>

              <div className={styles.detailItem}>
                <label className={styles.label}>
                  {t("fields.date")}:
                </label>
                <input
                  type="date"
                  name="date"
                  value={editedSession.date}
                  onChange={handleChange}
                  className={styles.input}
                />
                {errors.date && (
                  <span className={styles.error}>{errors.date}</span>
                )}
              </div>

              <div className={styles.detailItem}>
                <label className={styles.label}>
                  {t("fields.startTime")}:
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={editedSession.startTime}
                  onChange={handleChange}
                  className={styles.input}
                />
                {errors.startTime && (
                  <span className={styles.error}>{errors.startTime}</span>
                )}
              </div>

              <div className={styles.detailItem}>
                <label className={styles.label}>
                  {t("fields.endTime")}:
                </label>
                <input
                  type="time"
                  name="endTime"
                  min={addMinutes(editedSession.startTime,30)}
                  value={editedSession.endTime}
                  onChange={handleChange}
                  className={styles.input}
                />
                {errors.endTime && (
                  <span className={styles.error}>{errors.endTime}</span>
                )}
              </div>

              <div className={styles.detailItem}>
                <label className={styles.label}>
                  {t("fields.virtualLink")}:
                </label>
                <input
                  type="url"
                  name="virtualLink"
                  value={editedSession.virtualLink}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="https://example.com/session"
                />
                {errors.virtualLink && (
                  <span className={styles.error}>
                    {errors.virtualLink}
                  </span>
                )}
              </div>

              <div className={styles.buttonGroup}>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={loading || hasErrors(errors)}
                >
                  {!loading ? (
                    t("actions.save")
                  ) : (
                    <div className={styles.load}>
                      <span>{t("actions.saving")}</span>
                      <ClipLoader size={16} color="#fff" />
                    </div>
                  )}
                </button>

                <button
                  className={styles.cancelBtn}
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  {t("actions.cancel")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.detailItem}>
                <span className={styles.label}>
                  {t("fields.name")}:
                </span>
                <span className={styles.value}>
                  {splitLang(session.name).ar || session.course}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>
                  {t("fields.nameEn")}:
                </span>
                <span className={styles.value}>
                  {splitLang(session.name).en || session.course}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.label}>
                  {t("fields.date")}:
                </span>
                <span className={styles.value}>{session.date}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.label}>
                  {t("fields.startTime")}:
                </span>
                <span className={styles.value}>
                  {session.startTime}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.label}>
                  {t("fields.endTime")}:
                </span>
                <span className={styles.value}>
                  {session.endTime}
                </span>
              </div>

              {session.virtualLink && (
                <div className={styles.detailItem}>
                  <span className={styles.label}>
                    {t("fields.virtualLink")}:
                  </span>
                  <a
                    href={session.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {session.virtualLink}
                  </a>
                </div>
              )}

              <button
                className={styles.editBtn}
                onClick={() => setIsEditing(true)}
              >
                {t("actions.edit")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionDetails
