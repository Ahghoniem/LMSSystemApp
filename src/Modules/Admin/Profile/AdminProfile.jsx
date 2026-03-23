import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminProfile.module.css";
import { useTranslation } from "react-i18next";
import ProfileSkeleton from "../../../Components/Skeleton/ProfileSkeleton";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { concatLang, Decode_Token, getLang, getToken, splitLang } from "../../../Utils";
import { API_BASE_URL } from "../../../Constants";
import axiosInstance from "../../../Constants/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { englishRegex } from "../Manage-users/User-Details/Validators";
import { arabicRegex } from "../../../Auth/Regiester/validators";

export default function AdminProfile() {
  const { t } = useTranslation("adminProfile");
  const token = getToken();
  const tokenData = Decode_Token();
  const lang = getLang()


  const { data: admin, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/Admin/${tokenData?.id}`,
    queryKey: ["adminProfile"],
    token,
    options:{enabled:tokenData.role === "ADMIN"}
  });
  const { data: trainer, isLoading: isLoadingTrainer } = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/${tokenData?.id}`,
    queryKey: ["trainerProfile"],
    token,
    options:{enabled:tokenData.role === "TRAINER"}
  });

  const { data: supervisor, isLoading: isLoadingSupervisor } = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/Supervisor/${tokenData?.id}`,
    queryKey: ["SupervisorProfile"],
    token,
    options:{enabled:tokenData.role === "SUPERVISOR"}
  });
  const { data: superadmin, isLoading: isLoadingSuperAdmin } = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/SuperAdmin/${tokenData?.id}`,
    queryKey: ["SuperAdminProfile"],
    token,
    options:{enabled:tokenData.role === "SUPERADMIN"}
  });

  const memoizedAdminData = useMemo(() => {
    if (!trainer && !admin?.data && !supervisor?.data && !superadmin?.data) return null;
    return {
      arabicName: splitLang(admin?.data?.Name).ar ?? splitLang(trainer?.Name).ar ?? splitLang(supervisor?.data?.Name).ar?? splitLang(superadmin?.data?.Name).ar ?? "",
      englishName:splitLang(admin?.data?.Name ).en ?? splitLang(trainer?.Name).en ?? splitLang(supervisor?.data?.Name ).en ?? splitLang(superadmin?.data?.Name ).en ?? "" ,
      email: admin?.data?.User?.email ?? trainer?.User?.email ?? supervisor?.data?.User?.email ?? superadmin?.data?.User?.email ?? "",
    };
  }, [admin,trainer,supervisor,superadmin]);


  const [formData,setFormData]=useState({})
  const [originalData, setOriginalData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (memoizedAdminData) {
      setFormData(memoizedAdminData);
      setOriginalData(memoizedAdminData);
    }
  }, [memoizedAdminData]);

  const profileData = useMemo(() => {
    if (tokenData?.role === "ADMIN" && admin?.data) {
      return admin.data;
    }
  
    if (tokenData?.role === "TRAINER" && trainer) {
      return trainer;
    }
    if (tokenData?.role === "SUPERVISOR" && supervisor?.data) {
      return supervisor?.data;
    }
    if (tokenData?.role === "SUPERADMIN" && superadmin?.data) {
      return superadmin?.data;
    }
  
    return null;
  }, [admin, trainer, tokenData,supervisor,superadmin]);

  const permissions = profileData?.User?.permissions || [];
  
  
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [errors,setErrors]=useState({})

  const validateField = (name, value) => {
      let error = "";
      const isEmpty = !value || /^\s+$/.test(value);
      if (isEmpty) error = t("errors.required");
      if (name === "englishName" && !englishRegex.test(value))
        error = t("errors.english_only");
      if (name === "arabicName" && !arabicRegex.test(value))
        error = t("errors.arabic_only");
      if (name === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = t("errors.emailInvalid");
        }
      }
  
      if (name === "newPassword" && isEditing) {
        if (value.length < 8) {
          error = t("passwordLen");
        } else if (!/[A-Z]/.test(value)) {
          error = t("passwordUpper");
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          error = t("passwordSpecial");
        }
      }
  
      if (name === "confirmPassword" ) {
        if (passwordData.confirmPassword && value !== passwordData.newPassword) {
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

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error(t("passwordFieldsRequired") || "All password fields are required", {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("passwordsDoNotMatch") || "New passwords do not match", {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t("passwordMinLength") || "Password must be at least 6 characters", {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
        await axiosInstance.put(`SuperAdmin/Admin/${tokenData.id}`, {
          password: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        });
        toast.success(t("passwordUpdateSuccess") || "Password updated successfully", {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
        });
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    catch (error) {
      console.error("Password update error:", error);
      toast.error(
        error?.response?.data?.message || t("passwordUpdateError") || "Failed to update password",
        {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
        }
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
       if(tokenData.role === "ADMIN")
       {
        await axiosInstance.put(`SuperAdmin/Admin/${tokenData.id}`, {
          Name:concatLang(formData.englishName,formData.arabicName),
          email: formData.email,
        });
       }
       else if(tokenData.role === "TRAINER")
       {
        await axiosInstance.put(`SuperAdmin/${tokenData.id}`, {
          Name:concatLang(formData.englishName,formData.arabicName),
          email: formData.email,
        });
       }
       else if(tokenData.role === "SUPERVISOR")
       {
        await axiosInstance.put(`SuperAdmin/Supervisor/${tokenData.id}`, {
          Name:concatLang(formData.englishName,formData.arabicName),
          email: formData.email,
        });
       }
       else if(tokenData.role === "SUPERADMIN")
       {
        await axiosInstance.put(`SuperAdmin/Superadmin/${tokenData.id}`, {
          Name:concatLang(formData.englishName,formData.arabicName),
          email: formData.email,
        });
       }
        setOriginalData({ ...formData });
        setIsEditing(false);
        toast.success(t("updateSuccess") || "Profile updated successfully", {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
        });
      }
    catch (error) {
      console.error("Update error:", error);
      toast.error(t("updateError") || "Failed to update profile", {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if ( isLoading || isLoadingTrainer || isLoadingSupervisor || isLoadingSuperAdmin) {
    return <ProfileSkeleton />;
  }
  const hasErrors = (errors) => Object.values(errors).some((error) => error);

  return (
    <main className={styles.content}>
      <div className={styles.profileWrapper}>
        <div className={styles.profileCard}>
          {/* Main Title */}
          <h1 className={styles.mainTitle}>{t("myProfile")}</h1>

          {/* Description */}
          <p className={styles.description}>{t("description")}</p>

          {/* Update Section Title */}
          <h2 className={styles.updateTitle}>{t("updateInfo")}</h2>

          {/* Update Description */}
          <p className={styles.updateDescription}>{t("updateDescription")}</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <div className={styles.formRow}>
              {/* Username Field */}
              <div className={styles.formField}>
                <label htmlFor="username">{t("username")}</label>
                {
                  isEditing?
                  <input
                  type="text"
                  id="username"
                  name="arabicName"
                  value={formData.arabicName}
                  onChange={(e) => handleChange("arabicName", e.target.value)}
                  className={styles.inputField}
                  placeholder={t("usernamePlaceholder") || "Enter username"}
                />:
                <span className={styles.inputField}>{originalData.arabicName}</span>
                }
                {errors.arabicName && <span className={styles.error}>{errors.arabicName}</span>}
              </div>
              <div className={styles.formField}>
                <label htmlFor="jobTitle">{t("jobTitle")}</label>
                {isEditing?
                <input
                type="text"
                id="jobTitle"
                name="englishName"
                value={formData.englishName}
                onChange={(e) => handleChange("englishName", e.target.value)}
                className={styles.inputField}
                placeholder={t("jobTitlePlaceholder") || "Enter job title"}
              />:
              <span className={styles.inputField} >{originalData.englishName}</span>
                }
                {errors.englishName && <span className={styles.error}>{errors.englishName}</span>}
              </div>

              {/* Email Field */}
              <div className={styles.formField}>
                <label htmlFor="email">{t("email")}</label>
                {isEditing?
                <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={styles.inputField}
                placeholder={t("emailPlaceholder") || "Enter email"}
              />:
              <span className={styles.inputField}>{formData.email}</span>
                }
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>
            </div>

            {/* Action Buttons */}
            {!isEditing ? (
              <button
                type="button"
                onClick={handleEditClick}
                className={styles.submitButton}
              >
                {t("updateButton")}
              </button>
            ) : (
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelButton}
                >
                  {t("cancel") || "Cancel"}
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || hasErrors(errors)}
                >
                  {isSubmitting ? t("updating") || "Updating..." : t("save") || "Save"}
                </button>
              </div>
            )}
          </form>

          {/* Password Update Section */}
          <div className={styles.passwordSection}>
            <h2 className={styles.passwordTitle}>{t("updatePassword")}</h2>
            <p className={styles.passwordDescription}>{t("passwordDescription")}</p>

            <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
              <div className={styles.passwordFormRow}>
                {/* Right Column: Old Password and Confirm Password */}
                <div className={styles.passwordColumn}>
                  {/* Old Password Field */}
                  <div className={styles.passwordField}>
                    <label htmlFor="oldPassword">{t("oldPassword")}</label>
                    <div className={styles.passwordInputWrapper}>
                      <input
                        type={showPasswords.oldPassword ? "text" : "password"}
                        id="oldPassword"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                        className={styles.passwordInput}
                        placeholder={t("oldPasswordPlaceholder")}
                      />
                      <span
                        className={styles.eyeIcon}
                        onClick={() => togglePasswordVisibility("oldPassword")}
                      >
                        {showPasswords.oldPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {errors.oldPassword && <span className={styles.error}>{errors.oldPassword}</span>}
                  </div>

                  {/* Confirm Password Field */}
                  <div className={styles.passwordField}>
                    <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
                    <div className={styles.passwordInputWrapper}>
                      <input
                        type={showPasswords.confirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className={styles.passwordInput}
                        placeholder={t("confirmPasswordPlaceholder")}
                      />
                      <span
                        className={styles.eyeIcon}
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                      >
                        {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
                  </div>
                </div>

                {/* Left Column: New Password */}
                <div className={styles.passwordColumn}>
                  {/* New Password Field */}
                  <div className={styles.passwordField}>
                    <label htmlFor="newPassword">{t("newPassword")}</label>
                    <div className={styles.passwordInputWrapper}>
                      <input
                        type={showPasswords.newPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className={styles.passwordInput}
                        placeholder={t("newPasswordPlaceholder")}
                      />
                      <span
                        className={styles.eyeIcon}
                        onClick={() => togglePasswordVisibility("newPassword")}
                      >
                        {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {errors.newPassword && <span className={styles.error}>{errors.newPassword}</span>}
                  </div>
                </div>
              </div>

              {/* Submit Button - Centered */}
              <div className={styles.passwordButtonContainer}>
                <button
                  type="submit"
                  className={styles.passwordSubmitButton}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? t("updating") || "Updating..." : t("updatePasswordButton")}
                </button>
              </div>
            </form>
          </div>

          {/* Permissions Section */}
          <div className={styles.permissionsSection}>
            <h2 className={styles.permissionsTitle}>{t("yourPermissions") || "الصلاحيات الخاصة بك"}</h2>
            <p className={styles.permissionsDescription}>
              {t("permissionsDescription") || "هذه هي الصلاحيات الممنوحة لك في النظام."}
            </p>

            <div className={styles.permissionsTableContainer}>
              <table className={styles.permissionsTable}>
                <tbody>
                  {Array.from({ length: Math.ceil(permissions.length / 4) }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 4 }).map((_, colIndex) => {
                        const permissionIndex = rowIndex * 4 + colIndex;
                        return (
                          <td key={colIndex} className={styles.permissionCell}>
                            {lang === 'ar' ? splitLang(permissions[permissionIndex]?.viewName).ar :splitLang(permissions[permissionIndex]?.viewName).en  ??""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Toaster/>
    </main>
  );
}
