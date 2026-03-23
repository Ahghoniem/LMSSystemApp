/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./AddPermissionFile.module.css";
import { concatLang, getLang, getToken } from "../../../Utils";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../Constants";
import axiosInstance from "./../../../Constants/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { applyPermissionDependencies, buildPermissionDependencies } from "./PermissionChaining";

export default function AddPermissionFile() {
  const { t } = useTranslation("PermissionFile");
  const lang = getLang();
  const token = getToken();
  const [loading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
  });

  const [errors, setErrors] = useState({});
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;
  const englishRegex = /^[A-Za-z0-9\s]+$/;

  const validateField = (name, value) => {
    let error = "";
    if (name === "nameAr") {
      if (!value.trim()) error = t("requiredArabicName");
      else if (!arabicRegex.test(value.trim()))
        error = t("arabicOnly");
    }
    if (name === "nameEn") {
      if (!value.trim()) error = t("requiredEnglishName");
      else if (!englishRegex.test(value.trim()))
        error = t("englishOnly");
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const { data } = useFetchData({
    baseUrl: `${API_BASE_URL}Container`,
    queryKey: ["containers"],
    token,
  });

  const containers = useMemo(() => data?.data ?? [], [data]);
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

  /* ---------- FORM ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const hasErrors = (errors) =>
    Object.values(errors).some((error) => error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateField("nameAr", formData.nameAr);
    validateField("nameEn", formData.nameEn);

    const selectedPermissions = Object.entries(permissionsState)
      .flatMap(([_, perms]) =>
        Object.entries(perms)
          .filter(([_, checked]) => checked)
          .map(([permissionId]) => permissionId)
      );

    if (selectedPermissions.length < 1) {
      toast.error(t("selectAtLeastOnePermission"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
      return;
    }

    const payload = {
      name: concatLang(formData.nameEn, formData.nameAr),
      permissionIds: selectedPermissions,
    };

    try {
      setIsLoading(true);
      await axiosInstance.post("Profile", payload);

      setFormData({ nameAr: "", nameEn: "" });
      setPermissionsState({});

      toast.success(t("sucess"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.addPermissionPage}>
      <div className={styles.wrapper}>
        <div className={styles.permissionBox}>
          <div className={styles.permissionHeader}>
            <h1>{t("addNewPermissionFile")}</h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ---------- BASIC INFO ---------- */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                {t("permissionFileInfo")}
              </h2>

              <p className={styles.sectionDesc}>
                {t("fillPermissionFileDetails")}
              </p>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>{t("nameAr")}</label>
                  <input
                    type="text"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleChange}
                    placeholder={t("enterNameAr")}
                    required
                  />
                  {errors.nameAr && (
                    <span className={styles.error}>{errors.nameAr}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>{t("nameEn")}</label>
                  <input
                    type="text"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleChange}
                    placeholder={t("enterNameEn")}
                  />
                  {errors.nameEn && (
                    <span className={styles.error}>{errors.nameEn}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ---------- PERMISSIONS ---------- */}
            <div className={styles.permissionsSection}>
              <h3 className={styles.permissionsTitle}>
                {t("selectPermissions")}
              </h3>

              <p className={styles.permissionsDesc}>
                {t("choosePermissions")}
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
                        ? t("unselectGroup")
                        : t("selectGroup")}
                    </button>
                  </div>

                  <div className={styles.permsGrid}>
                    {container.permissions.map((perm) => (
                      <div
                        key={perm.permissionId}
                        className={styles.permItem}
                      >
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

              {/* ---------- GLOBAL BUTTON ---------- */}
             
            </div>

            <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={hasErrors(errors) || loading}
              className={styles.btn}
            >
              {loading ? (
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                t("createPermissionFile")
              )}
            </button>
                <button
                  type="button"
                  className="bg-[#b38e19] text-white p-3.5 rounded-md"
                  onClick={toggleAllPermissions}
                >
                  {isAllPermissionsSelected
                    ? t("unselectAllPermissions")
                    : t("selectAllPermissions")}
                </button>
            </div>
          </form>
        </div>
        <Toaster />
      </div>
    </div>
  );
}
