import React, { useState } from "react";
import styles from "./UserDetails.module.css";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Decode_Token, getLang, splitLang } from "../../../../Utils";
import { API_BASE_URL } from "../../../../Constants";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import {
  renderField,
  renderNationalityField,
  renderUniversityField,
} from "./UserDetailsFields";
import { validateField } from "./Validators";
import Popup from "../../../../Components/Popup/Popup";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../../Constants/axiosInstance";
import { ClipLoader } from "react-spinners";
import ProgressBar from "./ProgressBar";
import HasPermission from "../../../../Components/Permissions/HasPermission";

export default function UserDetails() {
  const [activeSection, setActiveSection] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
  const { state } = useLocation();
  const student = state?.student;
  const [formData, setFormData] = useState(student);
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [originalData, setOriginalData] = useState(student);
  const lang = getLang();
  const [errors, setErrors] = useState({});
  const { t } = useTranslation("userDetails");
  const [Disabled, setDisabled] = useState(true);
  const [isloadingDelete,setIsLoadingDelete]=useState(false)
  const { t: errorsTranslation } = useTranslation("register");
  const hasErrors = (errors) => Object.values(errors).some((error) => error);
  const keyMapping = {
    1: t("Teachers"),
    2: t("masters"),
    3: t("PHD"),
    4: t("diploma"),
  };
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    message: "",
    hasButtons: true,
  });
  const { data: universties } = useFetchData({
    baseUrl: `${API_BASE_URL}universities`,
    queryKey: ["unis"],
    params: { limit: 100 },
  });
  const { data: eventResponse } = useFetchData({
    baseUrl: `${API_BASE_URL}reservations/active-reservations?userId=${student.userId}`,
    queryKey: ["ev"],
  });

  // Extract the reservations array safely
  const reservations = eventResponse?.data || [];

  const { data: nations } = useFetchData({
    baseUrl: `${API_BASE_URL}nationality`,
    queryKey: ["nations"],
  });
  const data = nations?.data.data;

  const handleChange = (field, value) => {
    if (field === "email") {
      setFormData((prev) => ({ ...prev, User: { email: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    const error = validateField(
      field,
      value,
      errorsTranslation,
      formData.nationality
    );
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleEdit = async () => {
    if (!isEditing) {
      setOriginalData(formData);
    } else {
      const transformedUser = {
        id: formData.id,
        name_ar: formData.fullName,
        name_En: formData.NameEn,
        Mobile: formData.Mobile,
        department: formData.department,
        nationality: formData.nationality,
        national_id: formData.nationalId,
        university: formData.university,
        faculty: formData.college,
        StudyLan: formData.StudyLan,
        email: formData.User?.email || null,
        training_type:
          formData.User?.Payments?.[0]?.Product?.courseName || "Unknown",
      };
      console.log(transformedUser);
      try {
        setLoading(true);
        const res = await axiosInstance.put(
          `admin/usersManagment/${student.userId}`,
          transformedUser
        );
        toast.success(t("userUpdated"), {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
          duration: 4000,
        });
        console.log(res.data.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
    setErrors({});
    setIsEditing((prev) => !prev);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setPopup({
      open: true,
      type: "warning",
      message: t("deleteUserConfirm"),
      hasButtons: true,
    });
  };
  const DeleteUser = async (id) => {
    try {
      setIsLoadingDelete(true)
      const res = await axiosInstance.delete(
        `admin/usersManagment/delete/${id}`
      );
      console.log(res.data.data);
      setPopup({
        open: false,
        type: "warning",
        message: t("deleteUserConfirm"),
        hasButtons: true,
      });
      navigate(`/${role}/manage-users`);
    } catch (error) {
      toast.error(t("unexpectedError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 4000,
      });
      console.log(error);
    }finally{
      setIsLoadingDelete(false)
    }
  };

  const handleBack = () => {
    navigate(`/${role}/manage-users`);
  };

  const handleViewGrades = (id) => {
    navigate(`/${role}/user-grades/${id}`,);
  };

  console.log(formData?.status?.toLowerCase());
  

  return (
    <div className={styles.pageUserDetails}>
      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h1>
            {lang === "ar"
              ? `${t("title")} ${formData.fullName}`
              : `${formData.NameEn} ${t("details")}`}
          </h1>
        </div>

        {/* Progress Bar */}
        
        <ProgressBar currentStatus={formData.status || 'registered'} userData={formData} />

        <div className={styles.userDetailsContainer}>
          {/* Section Navigation */}
          <div className={styles.sectionNavigation}>
            <button
              className={`${styles.navBtn} ${
                activeSection === 1 ? styles.active : ""
              }`}
              onClick={() => setActiveSection(1)}
            >
              <i className="fas fa-user"></i>
              {t("personalInfo")}
            </button>
            <button
              className={`${styles.navBtn} ${
                activeSection === 2 ? styles.active : ""
              }`}
              onClick={() => setActiveSection(2)}
            >
              <i className="fas fa-graduation-cap"></i>
              {t("registrationInfo")}
            </button>
            <button
              className={`${styles.navBtn} ${
                activeSection === 3 ? styles.active : ""
              }`}
              onClick={() => {
                setActiveSection(3);
              }}
            >
              <i className="fas fa-registered"></i>
              {t("reservationInfo")}
            </button>
          </div>

          {/* Section 1: Personal Information */}
          {activeSection === 1 && (
            <div className={`${styles.userInfoCard} ${styles.sectionContent}`}>
              <div className={styles.sectionHeader}>
                <h2>{t("personalInfo")}</h2>
                <p>{t("personalInfoDesc")}</p>
              </div>
              <div className={styles.userDataGrid}>
                {renderField(
                  t("fields.nameAr"),
                  "fullName",
                  formData.fullName,
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  errors
                )}
                {renderField(
                  t("fields.nameEn"),
                  "NameEn",
                  formData.NameEn,
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  errors
                )}
                {renderNationalityField(
                  formData,
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  data,
                  lang
                )}
                {renderField(
                  t("fields.nationalId"),
                  "nationalId",
                  formData.nationalId,
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  errors
                )}
                {renderField(
                  t("fields.phone"),
                  "Mobile",
                  formData.Mobile,
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  errors
                )}
                {renderField(
                  t("fields.email"),
                  "email",
                  formData.User.email,
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  errors
                )}
              </div>
            </div>
          )}

          {/* Section 2: Registration Information */}
          {activeSection === 2 && (
            <div className={`${styles.userInfoCard} ${styles.sectionContent}`}>
              <div className={styles.sectionHeader}>
                <h2>{t("registrationInfo")}</h2>
                <p>{t("registrationInfoDesc")}</p>
              </div>
              <div className={styles.userDataGrid}>
                {renderUniversityField(
                  setShowInput,
                  handleChange,
                  setColleges,
                  styles,
                  universties,
                  isEditing,
                  showInput,
                  t,
                  formData,
                  colleges,
                  lang,
                  Disabled,
                  setDisabled
                )}

                {renderField(
                  t("fields.level"),
                  "level",
                  keyMapping[formData.type],
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  errors
                )}
                {renderField(
                  t("fields.preferredCourse"),
                  "preferredCourse",
                  lang === "ar"
                    ? splitLang(formData.User?.Payments[0]?.Product?.courseName).ar
                    : splitLang(formData.User?.Payments[0]?.Product?.courseName)
                        .en,
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  errors
                )}
                {renderField(
                  t("fields.language"),
                  "StudyLan",
                  formData.StudyLan,
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  errors
                )}
                {renderField(
                  t("fields.department"),
                  "department",
                  formData.department,
                  styles,
                  isEditing,
                  handleChange,
                  t,
                  errors
                )}
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div className={`${styles.userInfoCard} ${styles.sectionContent}`}>
              <div className={styles.sectionHeader}>
                <h2>{t("reservationInfo")}</h2>
                <p>{t("reservationInfoDesc")}</p>
              </div>
              <div style={{ backgroundColor: "white" }}>
                {reservations.length > 0 ? (
                  reservations.map((res) => {
                    const ev = res.reservationEvent;
                    return (
                      <div
                        key={res.reservationId}
                        className={styles.reservationCard}
                      >
                        {renderField(
                          t("fields.eventName"),
                          "eventName",
                          ev.eventName,
                          styles,
                          false
                        )}
                        {renderField(
                          t("fields.startDate"),
                          "startDate",
                          ev.startDate
                            ? new Date(ev.startDate).toLocaleDateString(lang)
                            : "",
                          styles,
                          false
                        )}
                        {renderField(
                          t("fields.endDate"),
                          "endDate",
                          ev.endDate
                            ? new Date(ev.endDate).toLocaleDateString(lang)
                            : "",
                          styles,
                          false
                        )}
                        {renderField(
                          t("fields.type"),
                          "type",
                          ev.type,
                          styles,
                          false
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p>{t("noReservations")}</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.btnSecondary} onClick={handleBack}>
              <i className="fas fa-arrow-right"></i> {t("back")}
            </button>

            {(formData?.status?.toLowerCase() === "reserved exam" || formData?.status?.toLowerCase() === "succeeded" ||
              formData?.status?.toLowerCase() === "failed" || formData?.status?.toLowerCase() === "reserved reexam")  && (
              <button
                className={styles.btnSecondary}
                onClick={()=>handleViewGrades(formData?.userId)}
              >
                <i className="fas fa-list-ol"></i> عرض الدرجات
              </button>
            )}

            <button
              className={styles.btnPrimary}
              disabled={hasErrors(errors) || loading || activeSection === 3}
              onClick={handleEdit}
            >
              <i className="fas fa-edit"></i>{" "}
              {isEditing ? (
                !loading ? (
                  t("saveChanges")
                ) : (
                  <div className={styles.load}>
                    <span>{t("loading")}</span>
                    <ClipLoader size={18} color="#fff" />
                  </div>
                )
              ) : (
                t("editData")
              )}
            </button>

            {isEditing ? (
              <HasPermission permission={"EDIT_USER"}>
                <button className={styles.btnCancel} onClick={handleCancel}>
                {t("cancel")} <i className="fas fa-times"></i>
              </button>
              </HasPermission>
            ) : (
              <HasPermission permission={"DELETE_USER"}>
                <button className={styles.btnDanger} onClick={handleDelete}>
                <i className="fas fa-trash"></i> {t("deleteUser")}
              </button>
              </HasPermission>
            )}
          </div>
        </div>
      </div>
      <Popup
        isOpen={popup.open}
        type={popup.type}
        message={popup.message}
        hasButtons={popup.hasButtons}
        to={"/"}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
        warning={true}
        action={() => DeleteUser(student.userId)}
        isloading={isloadingDelete}
      />
      <Toaster />
    </div>
  );
}
