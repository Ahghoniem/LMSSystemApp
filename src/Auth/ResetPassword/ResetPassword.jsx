import styles from "./ResetPassword.module.css";
import { ClipLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../Constants";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";
import { getAuth } from "../../Utils";


export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { t } = useTranslation("resetPassword");

  const hasErrors = (errors) => Object.values(errors).some((error) => error);

  const validateField = (name, value) => {
    let error = "";
  
    if (name === "password") {
      if (!value || /^\s+$/.test(value)) {
        error = t("passwordReq");
      } else if (value.length < 8) {
        error = t("passwordLen")
      } else if (!/[A-Z]/.test(value)) {
        error = t("passwordUpper");
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        error = t("passwordSpecial");
      } else if (confirmPassword && value !== confirmPassword) {
        error = t("passwordMatch");
      }
    }
  
    if (name === "confirmPassword") {
      if (!value || /^\s+$/.test(value)) {
        error = t("confirmPassReq");
      } else if (value !== password) {
        error = t("passwordMatch");
      }
    }
  
    setErrors((prev) => ({ ...prev, [name]: error }));
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else if (name === "password") {
      setPassword(value);
    }

    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateField("confirmPassword", confirmPassword);
    validateField("password", password);

    if (hasErrors(errors) || !confirmPassword || !password) {
        toast.error(t("AllFieldsReq"), {
            position: "top-center",
            style: { backgroundColor: "red", color: "white" },
            duration: 1500,
          });
          setErrors((prev) => ({ ...prev,  password:t("AllFieldsReq") , confirmPassword:t("AllFieldsReq")}))
          return;
    };
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}resetPassword`, {
        email:getAuth(),
        newPassword:password
      });
      setConfirmPassword("");
      setPassword("");
      toast.success(res.data.data, {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setTimeout(() => {
        navigate("/otp");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ", {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration:2000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.auth}>
        <div className={styles.verificationHeader}>
          <h1>{t("title")}</h1>
          <p className={styles.verificationSubtitle}>{t("subtitle")}</p>
        </div>

        <div className={styles.emailBox}>
          <form id="emailForm" onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder={t("emailPlaceholder")}
                
              />
              <div className={styles.error}>{errors.password}</div>

              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder={t("emailPlaceholderConfirm")}
                
              />
              <div className={styles.error}>{errors.confirmPassword}</div>
            </div>

            <button
              type="submit"
              disabled={hasErrors(errors) || loading}
              className={styles.btn}
            >
              {!loading ? (
                t("sendCode")
              ) : (
                <div className={styles.load}>
                  <span>{t("loading")}</span>
                  <ClipLoader size={18} color="#fff" />
                </div>
              )}
            </button>
          </form>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
