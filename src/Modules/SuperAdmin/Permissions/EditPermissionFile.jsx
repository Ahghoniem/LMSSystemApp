/* eslint-disable no-unused-vars */
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./EditPermissionFile.module.css";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { getToken, getLang, concatLang } from "../../../Utils";
import { API_BASE_URL } from "../../../Constants";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../Constants/axiosInstance";
import Popup from "../../../Components/Popup/Popup";
import { applyPermissionDependencies, buildPermissionDependencies } from "./PermissionChaining";
import EditPermissionSkeleton from "./EditPermissionSkeleton";

export default function EditPermissionFile() {
  const { t } = useTranslation("EditPermissionFile"); // Translation namespace
  const { id } = useParams();
  const token = getToken();
  const lang = getLang();
  const navigate=useNavigate()
  const [loading,setIsLoading]=useState(false)
  const [loadingDelte,setIsLoadingDelete]=useState(false)
  const [popup, setPopup] = useState({
          open: false,
          type: "success",
          message: "",
          hasButtons: true,
        });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

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

  const [permissionsState, setPermissionsState] = useState({});
  const { data: editProfile , isLoading:isLoadingProfile } = useFetchData({
    baseUrl: `${API_BASE_URL}Profile/${id}`,
    queryKey: ["editProfile"],
    token,
  });
  const { data: containersData,isLoading:isLoadingContainer } = useFetchData({
    baseUrl: `${API_BASE_URL}Container`,
    queryKey: ["permissions"],
    token,
  });

  const containers = useMemo(() => containersData?.data ?? [], [containersData]);

  useEffect(() => {
    if (!containers.length) return;
  
    const initialState = {};
  
    containers.forEach((container) => {
      const containerPermissions = editProfile?.data?.permissions?.filter(
        (p) => p.containerId === container.containerId
      ) || [];
  
      initialState[container.containerId] = Object.fromEntries(
        container.permissions.map((p) => [
          p.permissionId,
          containerPermissions.some((cp) => cp.permissionId === p.permissionId),
        ])
      );
    });
  
    setPermissionsState(initialState);
  
    if (editProfile?.data?.name) {
      const [en, ar] = editProfile.data.name.split("|");
      setFormData({ nameEn: en?.trim() || "", nameAr: ar?.trim() || "" });
    }
  }, [containers, editProfile]);
  

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name,value)
  };

  const hasErrors = (errors) => Object.values(errors).some((error) => error);


  const handleUpdate = async(e) => {
    e.preventDefault();
    validateField("nameAr", formData.nameAr);
    validateField("nameEn", formData.nameEn);
    const selectedPermissions = Object.entries(permissionsState).flatMap(([_, perms]) =>
      Object.entries(perms)
        .filter(([_, checked]) => checked)
        .map(([permissionId]) => permissionId)
    );

    const payload = {
      name: concatLang(formData.nameEn, formData.nameAr),
      permissionIds: selectedPermissions,
    };
    if(selectedPermissions.length<1)
      {
        toast.error(t("selectAtLeastOnePermission"), {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
          duration: 2000,
      });
      return
      }
      try {
        setIsLoading(true)
        await axiosInstance.put(`Profile/${editProfile?.data?.profileId}`, payload);
        setFormData({ nameAr: "", nameEn: "" });
        setPermissionsState({});
        toast.success(t("sucess"), {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
          duration: 500,
      });
      setTimeout(() => {
        navigate("/superadmin/permission-files")
      }, 500);
      } catch (error) {
        console.log(error);
      }
      finally{
        setIsLoading(false)
      }
  };

  const handleDelete = () => {
    setPopup({
      open: true,
      type: "warning",
      message: t("popupMessage"),
      hasButtons: true,
    })
  };
  const DeleteFile=async() => {
    try {
      setIsLoadingDelete(true)
      await axiosInstance.delete(`Profile/${editProfile?.data?.profileId}`)
      navigate("/superadmin/permission-files")
    } catch (error) {
      console.log(error);
    }finally{
      setIsLoadingDelete(false)
    }
  }

  return (
    <div className={styles.editPermissionPage}>
      <div className={styles.wrapper}>
        <div className={styles.permissionBox}>
          <div className={styles.permissionHeader}>
            <h1>{t("editPermissionFile")}</h1>
          </div>

          {isLoadingContainer || isLoadingProfile ? 
          <EditPermissionSkeleton/>:
          <form onSubmit={handleUpdate}>
            {/* ---------- BASIC INFO ---------- */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>{t("permissionFileInfo")}</h2>
              <p className={styles.sectionDesc}>{t("fillPermissionFileDetails")}</p>

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
                  {errors.nameAr && <span className={styles.error}>{errors.nameAr}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>{t("nameEn")}</label>
                  <input
                    type="text"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleChange}
                    placeholder={t("enterNameEn")}
                    required
                  />
                  {errors.nameEn && <span className={styles.error}>{errors.nameEn}</span>}
                </div>
              </div>
            </div>

            {/* ---------- PERMISSIONS ---------- */}
            <div className={styles.permissionsSection}>
              <h3 className={styles.permissionsTitle}>{t("reselectPermissions")}</h3>
              <p className={styles.permissionsDesc}>{t("choosePermissions")}</p>

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
                        ? t("unselectGroup")
                        : t("selectGroup")}
                    </button>
                  </div>

                  <div className={styles.permsGrid}>
                    {container.permissions.map((perm) => (
                      <div key={perm.permissionId} className={styles.permItem}>
                        <input
                          type="checkbox"
                          checked={permissionsState[container.containerId]?.[perm.permissionId] || false}
                          onChange={(e) =>
                            togglePermission(
                              container.containerId,
                              perm.permissionId,
                              e.target.checked
                            )
                          }
                          className={styles.checkbox}
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
            </div>

            <div className={`flex justify-between items-center ${styles.buttonsContainer}`}>
            <div className={styles.buttonsContainer}>
              <button type="submit" disabled={hasErrors(errors) || loading} className={styles.btnUpdate}>
                 {loading? 
                <div className={"animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full"}>
                </div>
              :t("updatePermissionFile")}
              </button>
              <button type="button" onClick={handleDelete} className={styles.btnDelete}>
                {t("deletePermissionFile")}
              </button>
            </div>
            <div className={`flex justify-end`}>
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
            </div>
          </form>
          }
        </div>
      </div>
      <Popup
              isOpen={popup.open}
              type={popup.type}
              message={popup.message}
              hasButtons={popup.hasButtons}
              to={"/"}
              warning={true}
              onClose={() => setPopup((p) => ({ ...p, open: false }))}
              action={DeleteFile}
              isloading={loadingDelte}
            />
      <Toaster/>
    </div>
  );
}
