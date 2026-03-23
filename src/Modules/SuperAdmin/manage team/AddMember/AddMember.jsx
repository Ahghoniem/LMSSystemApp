/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import styles from "./AddMember.module.css";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../../Constants/axiosInstance";
import { ClipLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import { concatLang, getLang, getToken, splitLang } from "../../../../Utils";
import {
  arabicRegex,
  englishRegex,
} from "../../../../Auth/Regiester/validators";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../../Constants";
import { applyPermissionDependencies, buildPermissionDependencies } from "../../Permissions/PermissionChaining";

export default function AddMember() {
  const { t } = useTranslation("AddMember");
  const { state } = useLocation();
  const member = state?.member;
  const type = state?.type;
  const token = getToken();
  const lang = getLang();
  

  const getInitialData = () => {
    if (!member) {
      return {
        nameAr: "",
        nameEn: "",
        email: "",
        password: "",
        confirmPassword: "",
      };
    }

    const fullName = member.fullName || member.name || "";
    const nameParts = fullName ? splitLang(fullName) : { ar: "", en: "" };

    return {
      nameAr: nameParts.ar || member.nameAr || "",
      nameEn: nameParts.en || member.nameEn || member.NameEn || "",
      email: member.email || "",
      password: "",
      confirmPassword: "",
    };
  };

  const [formData, setFormData] = useState(getInitialData());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedPermissionFile, setSelectedPermissionFile] = useState("");

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

    if (name === "password") {
      if (value.length < 8) {
        error = t("errors.passwordLen");
      } else if (!/[A-Z]/.test(value)) {
        error = t("errors.passwordUpper");
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        error = t("errors.passwordSpecial");
      }
    }

    if (name === "confirmPassword") {
      if (formData.password && value !== formData.password) {
        error = t("errors.passwordMismatch");
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
    if (name === "password" && formData.confirmPassword) {
      validateField("confirmPassword", formData.confirmPassword);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    const selectedPermissionNames = Object.entries(permissionsState)
      .flatMap(([containerId, perms]) => {
        const container = containers.find((c) => c.containerId === containerId);
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
      });

    if (selectedPermissionNames.length < 1) {
      toast.error(t("errors.selectAtLeastOnePermission"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        Name: concatLang(formData.nameEn, formData.nameAr),
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        permissionList: selectedPermissionNames,
      };

      if (type === "trainer") {
        await axiosInstance.post("SuperAdmin/add-Trainer", submitData);
      } else if (type === "super") {
        await axiosInstance.post(
          "SuperAdmin/Supervisor/add-Supervisor",
          submitData
        );
      } else {
        await axiosInstance.post("SuperAdmin/Admin/add-Admin", submitData);
      }

      toast.success(t("messages.memberAdded"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });

      setLoading(false);
      setFormData(getInitialData());
      setErrors({});
      setPermissionsState({});
      setSelectedPermissionFile(null)
    } catch (error) {
      console.log(error);
      setLoading(false);

      const errorMessage =
        error.response?.data?.message || t("messages.errorAdding");
      toast.error(errorMessage, {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
    }
  };

  const hasErrors = () => {
    return (
      Object.values(errors).some((error) => error) ||
      !formData.nameAr.trim() ||
      !formData.nameEn.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    );
  };

  return (
    <div className={styles.addMemberPage}>
      <Toaster />
      <div className={styles.memberBox}>
        <div className={styles.memberHeader}>
          <h1>
            {type === "trainer"
              ? t("titles.addNewMemberTrain")
              : type === "super"
              ? t("titles.addNewMemberSuper")
              : t("titles.addNewMemberAdmin")}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>{t("fields.nameAr")}</label>
              <input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                placeholder={t("placeholders.nameAr")}
              />
              {errors.nameAr && (
                <span className={styles.error}>{errors.nameAr}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>{t("fields.nameEn")}</label>
              <input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                placeholder={t("placeholders.nameEn")}
              />
              {errors.nameEn && (
                <span className={styles.error}>{errors.nameEn}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>{t("fields.email")}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("placeholders.email")}
              />
              {errors.email && (
                <span className={styles.error}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>{t("fields.password")}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("placeholders.password")}
              />
              {errors.password && (
                <span className={styles.error}>{errors.password}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>{t("fields.confirmPassword")}</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("placeholders.confirmPassword")}
              />
              {errors.confirmPassword && (
                <span className={styles.error}>{errors.confirmPassword}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>{t("fields.permissionFile")}</label>
              <select
                name="permissionFile"
                value={selectedPermissionFile}
                onChange={(e) => handleProfileChange(e.target.value)}
              >
                <option value="">{t("placeholders.selectPermissionFile")}</option>
                {profiles.map((profile) => (
                  <option key={profile.profileId} value={profile.profileId}>
                    {lang === "ar"
                      ? profile.name.split("|")[1]
                      : profile.name.split("|")[0]}
                  </option>
                ))}
              </select>

              {isLoading && (
                <span className={styles.loadingText}>
                  {t("placeholders.loading")}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={styles.btn}
              disabled={loading || hasErrors()}
            >
              {!loading ? (
                <>
                  <i className="fa-solid fa-check"></i>{" "}
                  {member ? t("buttons.updateMember") : t("buttons.addMember")}
                </>
              ) : (
                <div className={styles.load}>
                  <span>{t("buttons.loading")}</span>
                  <ClipLoader size={18} color="#fff" />
                </div>
              )}
            </button>
          </div>
        </form>

        <div className={styles.permissionsSection}>
          <h3 className={styles.permissionsTitle}>
            {t("permissionsSection.title")}
          </h3>
          <p className={styles.permissionsDesc}>
            {t("permissionsSection.desc")}
          </p>

          {containers.map((container) => (
            <div key={container.containerId} className={styles.permissionsBox}>
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
              className="bg-[#b38e19] text-white p-3.5 cursor-pointer rounded-md"
              onClick={toggleAllPermissions}
            >
              {isAllPermissionsSelected
                ? t("permissionsSection.unselectAllPermissions")
                : t("permissionsSection.selectAllPermissions")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
