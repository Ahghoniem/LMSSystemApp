/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import styles from "./MemberDetails.module.css";
import { concatLang, Decode_Token, getLang, getToken, splitLang } from "../../../../Utils";
import axiosInstance from "../../../../Constants/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import Popup from "../../../../Components/Popup/Popup";
import {
  arabicRegex,
  englishRegex,
} from "../../../../Auth/Regiester/validators";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../../Constants";
import { useAuth } from "../../../../Context/AuthContext";
import HasPermission from "../../../../Components/Permissions/HasPermission";
import { applyPermissionDependencies, buildPermissionDependencies } from "../../Permissions/PermissionChaining";

export default function MemberDetails() {
  const { t } = useTranslation("MemberDetails");
  const navigate = useNavigate();
  const tokenData=Decode_Token()
  const role =tokenData.role.toLowerCase()
  const { state } = useLocation();
  const member = state?.member;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = getToken();
  const lang = getLang();
  const [originalPermissionsState, setOriginalPermissionsState] = useState({});
  const {updatePermissions} =useAuth()

  

  const { data: trainerData } = useFetchData({
      baseUrl: `${API_BASE_URL}SuperAdmin/${member.userId}`,
      queryKey: ["memberDetails"],
      token,
      options: { keepPreviousData: true,enabled: member.User.role === "TRAINER" },
    });
  
  
    const { data: superData } = useFetchData({
      baseUrl: `${API_BASE_URL}SuperAdmin/Supervisor/${member.userId}`,
      queryKey: ["memberDetails"],
      token,
      options: { keepPreviousData: true, enabled: member.User.role === "SUPERVISOR" },
    });
  
  
    const { data: adminData} = useFetchData({
      baseUrl: `${API_BASE_URL}SuperAdmin/Admin/${member.userId}`,
      queryKey: ["memberDetails"],
      token,
      options: { keepPreviousData: true,enabled: member.User.role === "ADMIN" },
    });

    const teamMember=adminData?.data ?? superData?.data ?? trainerData ?? member
    

  const getInitialData = () => {
    if (!teamMember)
      return {
        nameAr: "",
        nameEn: "",
        email: "",
        password: "",
        confirmPassword: "",
      };

    const fullName = teamMember.fullName || teamMember.Name || "";
    const nameParts = fullName ? splitLang(fullName) : { ar: "", en: "" };

    return {
      nameAr: nameParts.ar || teamMember.nameAr || "",
      nameEn: nameParts.en || teamMember.nameEn || teamMember.NameEn || "",
      email: teamMember.User.email || "",
      password: "",
      confirmPassword: "",
    };
  };

  const initialData = getInitialData();
  const [formData, setFormData] = useState(initialData);
  const [originalData, setOriginalData] = useState({ ...initialData });
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState({
    open: false,
    type: "warning",
    message: "",
    hasButtons: true,
  });

  const { data } = useFetchData({
    baseUrl: `${API_BASE_URL}Container`,
    queryKey: ["containers"],
    token,
  });

  const { data: Profiles, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}Profile`,
    queryKey: ["files"],
    token,
    options: { keepPreviousData: true },
  });

  const containers = useMemo(() => data?.data ?? [], [data]);
  const profiles = useMemo(() => Profiles?.data?.data ?? [], [Profiles]);
  const [permissionsState, setPermissionsState] = useState({});
  const [selectedPermissionFile, setSelectedPermissionFile] = useState("");
  

  useEffect(() => {
    if (!containers.length) return;

    const initialState = {};
    containers.forEach((container) => {
      initialState[container.containerId] = Object.fromEntries(
        container.permissions.map((p) => [p.permissionId, false])
      );
    });
    setPermissionsState(initialState);
  }, [containers]);

  useEffect(() => {
    if (!containers.length || !teamMember?.User?.permissions) return;
  
    const userPermIds = teamMember.User.permissions.map((p) => p.permissionId);
  
    const newState = {};
  
    containers.forEach((container) => {
      newState[container.containerId] = {};
  
      container.permissions.forEach((perm) => {
        const hasPermission = userPermIds.includes(perm.permissionId);
        newState[container.containerId][perm.permissionId] = hasPermission;
      });
    });
  
    setPermissionsState(newState);
    setOriginalPermissionsState(newState);
  }, [containers, teamMember]);
  
  

  /* ---------- PER CONTAINER ---------- */
  const isAllSelected = (container) =>
    container.permissions.every(
      (p) => permissionsState[container.containerId]?.[p.permissionId]
    );

  const toggleAll = (container) => {
    const next = !isAllSelected(container);

    setPermissionsState((prev) => ({
      ...prev,
      [container.containerId]: Object.fromEntries(
        container.permissions.map((p) => [p.permissionId, next])
      ),
    }));
  };

  const permissionDependenciesById = buildPermissionDependencies(containers);
    const togglePermission = (containerId, permissionId, checked) => {
      setPermissionsState((prev) => {
        const nextState = {
          ...prev,
          [containerId]: {
            ...prev[containerId],
            [permissionId]: checked,
          },
        };
    
        if (checked) return applyPermissionDependencies(nextState, permissionDependenciesById);
        return nextState;
      });
    };

  /* ---------- GLOBAL SELECT ALL ---------- */
  const isAllPermissionsSelected = useMemo(() => {
    if (!containers.length) return false;

    return containers.every((container) =>
      container.permissions.every(
        (p) =>
          permissionsState[container.containerId]?.[p.permissionId] === true
      )
    );
  }, [containers, permissionsState]);

  const didPermissionsChange = () => {
    return JSON.stringify(permissionsState) !== JSON.stringify(originalPermissionsState);
  };

  const toggleAllPermissions = () => {
    const nextValue = !isAllPermissionsSelected;

    const newState = {};
    containers.forEach((container) => {
      newState[container.containerId] = Object.fromEntries(
        container.permissions.map((p) => [p.permissionId, nextValue])
      );
    });

    setPermissionsState(newState);
  };

  const handleProfileChange = (profileId) => {
    setSelectedPermissionFile(profileId);

    const selectedProfile = profiles.find((p) => p.profileId === profileId);
    if (!selectedProfile) return;

    const newState = {};

    containers.forEach((container) => {
      newState[container.containerId] = {};

      container.permissions.forEach((perm) => {
        const hasPermission = selectedProfile.permissions.some(
          (p) =>
            p.containerId === container.containerId &&
            p.permissionId === perm.permissionId
        );

        newState[container.containerId][perm.permissionId] = hasPermission;
      });
    });

    setPermissionsState(newState);
  };

  const validateField = (name, value) => {
    let error = "";
    const isEmpty = !value || /^\s+$/.test(value);
    if (isEmpty) error = t("errors.required");
    if (name === "nameEn" && !englishRegex.test(value))
      error = t("errors.english_only");
    if (name === "nameAr" && !arabicRegex.test(value))
      error = t("errors.arabic_only");
    if (name === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = t("errors.emailInvalid");
      }
    }

    if (name === "password" && isEditing) {
      if (value.length < 8) {
        error = t("passwordLen");
      } else if (!/[A-Z]/.test(value)) {
        error = t("passwordUpper");
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        error = t("passwordSpecial");
      }
    }

    if (name === "confirmPassword" && isEditing) {
      if (formData.password && value !== formData.password) {
        error = t("errors.passwordMismatch");
      }
    }

    return error;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const hasErrors = () => {
    return (
      Object.values(errors).some((error) => error) ||
      !formData.nameAr.trim() ||
      !formData.nameEn.trim() ||
      !formData.email.trim()
    );
  };
  const handleEdit = async () => {
    if (!isEditing) {
      setOriginalData({ ...formData });
      setIsEditing(true);
    } else {
      // Validate all fields
      const newErrors = {};
      Object.keys(formData).forEach((key) => {
        if (key !== "password" && key !== "confirmPassword") {
          const error = validateField(key, formData[key]);
          if (error) newErrors[key] = error;
        }
      });
      if (formData.password || formData.confirmPassword) {
        if (!formData.password) {
          newErrors.password = t("errors.passwordRequired");
        } else if (formData.password.length < 6) {
          newErrors.password = t("errors.passwordMinLength");
        }

        if (!formData.confirmPassword) {
          newErrors.confirmPassword = t("errors.confirmPasswordRequired");
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = t("errors.passwordMismatch");
        }
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        return;
      }
      const selectedPermissionNames = Object.entries(permissionsState).flatMap(
        ([containerId, perms]) => {
          const container = containers.find(
            (c) => c.containerId === containerId
          );
          if (!container) return [];

          return Object.entries(perms)
            .filter(([permissionId, checked]) => checked)
            .map(([permissionId]) => {
              const permission = container.permissions.find(
                (p) => p.permissionId === permissionId
              );
              return permission ? permission.name : null;
            })
            .filter(Boolean);
        }
      );

      if (selectedPermissionNames.length < 1) {
        toast.error(t("errors.selectAtLeastOnePermission"), {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
          duration: 2000,
        });
        return;
      }
      
      
      if (didPermissionsChange()) {
        try {
          setLoading(true);
           const res=await axiosInstance.post(`admin/usersManagment/${teamMember.userId}/permissions`,{
            permissions:selectedPermissionNames
          })
          // updatePermissions(res.data.message.assignedPermissions)
          
          setLoading(false)
          } catch (error) {
            setLoading(false)
          return
        }
      }
      
      try {
        setLoading(true);
        const updateData = {
          Name: concatLang(formData.nameEn, formData.nameAr),
          email: formData.email,
        };
        if (formData.password && formData.confirmPassword) {
          updateData.password = formData.password;
          updateData.confirmPassword = formData.confirmPassword;
        }

        const memberId = member?.id || member?.userId || member?.memberId;
        if (member.User.role === "TRAINER") {
          await axiosInstance.put(`SuperAdmin/${memberId}`, updateData);
        } else if (member.User.role === "SUPERVISOR") {
          await axiosInstance.put(
            `SuperAdmin/Supervisor/${memberId}`,
            updateData
          );
        } else {
          await axiosInstance.put(`SuperAdmin/Admin/${memberId}`, updateData);
        }

        toast.success(t("updateSuccess"), {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
          duration: 2000,
        });
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));

        setLoading(false);
        setIsEditing(false);
      } catch (error) {
        console.log(error);
        toast.error(t("updateError"), {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
          duration: 2000,
        });
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setErrors({});
    setIsEditing(false);
  };

  const handleDelete = () => {
    setPopup({
      open: true,
      type: "warning",
      message: t("deleteConfirm"),
      hasButtons: true,
    });
  };

  const deleteMember = async () => {
    try {
      setLoading(true);
      const memberId = member?.id || member?.userId || member?.memberId;

      if (member.User.role === "TRAINER") {
        await axiosInstance.delete(`SuperAdmin/${memberId}`);
      } else if (member.User.role === "SUPERVISOR") {
        await axiosInstance.delete(`SuperAdmin/Supervisor/${memberId}`);
      } else {
        await axiosInstance.delete(`SuperAdmin/Admin/${memberId}`);
      }
      toast.success(t("deleteSuccess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });

      setPopup({ ...popup, open: false });
      navigate(`/${role}/manage-team`, {
        state: { type: member.User.role },
      });
    } catch (error) {
      console.log(error);
      toast.error(t("deleteError"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
      setLoading(false);
      setPopup({ ...popup, open: false });
    }
  };

  const handleBack = () => {
    navigate(`/${role}/manage-team`, { state: { type: member.User.role } });
  };

  if (!member) {
    return (
      <div className={styles.container}>
        <h2>{t("memberNotFound")}</h2>
        <button onClick={handleBack}>{t("back")}</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("memberDetails")}</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.detailsGrid}>
          <div className={styles.detailRow}>
            <span className={styles.label}>{t("nameAr")}:</span>
            {isEditing ? (
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => handleChange("nameAr", e.target.value)}
                  className={`${styles.editInput} ${
                    errors.nameAr ? styles.inputError : ""
                  }`}
                />
                {errors.nameAr && (
                  <span className={styles.errorText}>{errors.nameAr}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{formData.nameAr || "-"}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("nameEn")}:</span>
            {isEditing ? (
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => handleChange("nameEn", e.target.value)}
                  className={`${styles.editInput} ${
                    errors.nameEn ? styles.inputError : ""
                  }`}
                />
                {errors.nameEn && (
                  <span className={styles.errorText}>{errors.nameEn}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{formData.nameEn || "-"}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t("email")}:</span>
            {isEditing ? (
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`${styles.editInput} ${
                    errors.email ? styles.inputError : ""
                  }`}
                />
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>
            ) : (
              <span className={styles.value}>{formData.email || "-"}</span>
            )}
          </div>

          {isEditing && (
            <>
              <div className={styles.detailRow}>
                <span className={styles.label}>{t("newPassword")}:</span>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`${styles.editInput} ${
                      errors.password ? styles.inputError : ""
                    }`}
                    placeholder={t("passwordPlaceholder")}
                  />
                  {errors.password && (
                    <span className={styles.errorText}>{errors.password}</span>
                  )}
                </div>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>{t("confirmPassword")}:</span>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    className={`${styles.editInput} ${
                      errors.confirmPassword ? styles.inputError : ""
                    }`}
                    placeholder={t("confirmPasswordPlaceholder")}
                  />
                  {errors.confirmPassword && (
                    <span className={styles.errorText}>
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              {/* Permission File Select */}
              <div className={styles.detailRow}>
                <span className={styles.label}>{t("permissionFile")}</span>
                <div className={styles.inputWrapper}>
                  <select
                    name="permissionFile"
                    value={selectedPermissionFile}
                    onChange={(e) => handleProfileChange(e.target.value)}
                  >
                    <option value="">{t("selectPermissionFile")}</option>
                    {profiles.map((profile) => (
                      <option key={profile.profileId} value={profile.profileId}>
                        {lang === "ar"
                          ? profile.name.split("|")[1]
                          : profile.name.split("|")[0]}
                      </option>
                    ))}
                  </select>
                  {isLoading && (
                    <span className={styles.loadingText}>{t("loading")}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {isEditing && (
          <div className={styles.permissionsSection}>
            <h3 className={styles.permissionsTitle}>
              {t("permissionsSection.title")}
            </h3>
            <p className={styles.permissionsDesc}>
              {t("permissionsSection.desc")}
            </p>

            {containers.map((container) => (
              <div
                key={container.containerId}
                className={styles.permissionsBox}
              >
                <div className={styles.boxTitleContainer}>
                  <h4 className={styles.boxTitle}>
                    {lang === "ar"
                      ? container.name.split("|")[1]
                      : container.name.split("|")[0]}
                  </h4>

                  <button
                    type="button"
                    className={styles.btnView}
                    onClick={() => toggleAll(container)}
                  >
                    {isAllSelected(container)
                      ? t("permissionsSection.unselectGroup")
                      : t("permissionsSection.selectGroup")}
                  </button>
                </div>

                <div className={styles.permsGrid}>
                  {container.permissions.map((perm) => (
                    <div key={perm.permissionId} className={styles.permItem}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={
                          permissionsState[container.containerId]?.[
                            perm.permissionId
                          ] || false
                        }
                        onChange={(e) =>
                          togglePermission(
                            container.containerId,
                            perm.permissionId,
                            e.target.checked
                          )
                        }
                      />

                      <span className={styles.permLabel}>
                        {lang === "ar"
                          ? perm.viewName.split("|")[1]
                          : perm.viewName.split("|")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex w-full justify-end">
              <button
                type="button"
                className="bg-[#b38e19] text-white p-3.5 mb-5 cursor-pointer rounded-lg"
                onClick={toggleAllPermissions}
              >
                {isAllPermissionsSelected
                  ? t("permissionsSection.unselectAllPermissions")
                  : t("permissionsSection.selectAllPermissions")}
              </button>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  className={styles.editButton}
                  onClick={handleEdit}
                  disabled={loading || hasErrors()}
                >
                  {loading ? (
                    <div className={styles.loading}>
                      <span>{t("saving")}</span>
                      <ClipLoader size={18} color="#fff" />
                    </div>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i> {t("saveChanges")}
                    </>
                  )}
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <i className="fa-solid fa-xmark"></i> {t("cancel")}
                </button>
              </>
            ) : (
              <>
                {member.User.role === "TRAINER" && (
                  <HasPermission permission={"VIEW_ASSGINED_TRAININGS"}>
                    <button
                    type="button"
                    className={styles.editButton}
                    onClick={() =>
                      navigate(
                        `/${role}/trainer-trainings/${member.userId}`
                      )
                    }
                  >
                    عرض التدريبات الملحقه
                  </button>
                  </HasPermission>
                )}
                {member.User.role === "SUPERVISOR" && (
                  <HasPermission permission={"VIEW_ASSGINED_EXAMS"}>
                    <button
                    type="button"
                    className={styles.editButton}
                    onClick={() =>
                      navigate(
                        `/${role}/supervisor-exams/${member.userId}`
                      )
                    }
                  >
                    عرض الامتحانات الملحقه
                  </button>
                  </HasPermission>
                )}
                <HasPermission permission={member.User.role === "SUPERVISOR"?"EDIT_SUPERVISOR":member.User.role === "TRAINER"?"EDIT_TRAINER":"EDIT_ADMIN" }>
                <button className={styles.editButton} onClick={handleEdit}>
                  <i className="fa-solid fa-pen-to-square"></i> {t("edit")}
                </button>
                </HasPermission>
                <HasPermission permission={member.User.role === "SUPERVISOR"?"DELETE_SUPERVISOR":member.User.role === "TRAINER"?"DELETE_TRAINER":"DELETE_ADMIN" }>
                <button
                  className={styles.deleteButton}
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <i className="fa fa-trash"></i> {t("delete")}
                </button>
                </HasPermission>
              </>
            )}
          </div>

          <button
            className={styles.backButton}
            onClick={handleBack}
            title={t("back")}
          >
            <i
              className={
                lang === "ar"
                  ? "fa-solid fa-arrow-left"
                  : "fa-solid fa-arrow-right"
              }
            ></i>
          </button>
        </div>
      </div>

      <Popup
        isOpen={popup.open}
        type={popup.type}
        message={popup.message}
        hasButtons={popup.hasButtons}
        onClose={() => setPopup({ ...popup, open: false })}
        warning={true}
        action={deleteMember}
        isloading={loading}
      />
      <Toaster />
    </div>
  );
}
