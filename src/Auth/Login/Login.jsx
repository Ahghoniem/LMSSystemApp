/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import styles from "./Login.module.css";
import toast, { Toaster } from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Model from "../../Components/Model/Model";
import axios from "axios";
import { API_BASE_URL } from "../../Constants";
import { getLang, setAuth, setStatus, setToken, splitLang } from "../../Utils";
import { ClipLoader } from "react-spinners";
import { FaEye, FaEyeSlash } from "react-icons/fa"; //
import { useAuth } from "../../Context/AuthContext";
export default function Login() {
  const { t, i18n } = useTranslation("login");
  const lang = getLang();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    email: "",
  });
  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
    setEmail("");
    setErrors({ username: "", password: "", email: "" });
  };
  const { login } = useAuth();

  const params = new URLSearchParams(location.search);
  const msg = params.get("msg");

  useEffect(() => {
    if (msg === "session_expired") toast.error(t(msg), {
            position: "top-center",
            style: { backgroundColor: "red", color: "white" },
            duration: 4000,
          });
  }, [msg]);
  const validateField = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!value || /^\s+$/.test(value)) {
        error = t("emailReq"); // e.g. "البريد الإلكتروني مطلوب"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = t("emailInvalid"); // e.g. "صيغة البريد الإلكتروني غير صحيحة"
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const verifyEmail = async (email) => {
    try {
      const res = await axios.post(`${API_BASE_URL}verify-email`, {
        email: email,
      });
      if (res.data.status === 200) return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ", {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 2000,
      });
      return false;
    }
  };
  const handlChangeEmail = (e) => {
    const { value, name } = e.target;
    validateField(name, value);
    setEmail(value);
  };
  const onSubmitEmail = async (e) => {
    let error = "";
    e.preventDefault();
    if (email.length > 1) {
      try {
        const found = await verifyEmail(email);
        if (found) {
          setLoading(true);
          const res = await axios.post(`${API_BASE_URL}send-otp`, {
            email: email,
          });
          setEmail("");
          toast.success(res.data.message, {
            position: "top-center",
            style: { backgroundColor: "green", color: "white" },
            duration: 1500,
          });
          setTimeout(() => {
            navigate("/otp");
          }, 1500);
          setAuth(email);
          setStatus("Reset-Password");
        }
      } catch (error) {
        console.log(error);
        toast.error(t("NetworkError"), {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
          duration: 1500,
        });
        setLoading(false);
      }
    } else {
      toast.error(t("AllFieldsReq"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 1500,
      });
      setLoading(false);
      error = t("AllFieldsReq");
      setErrors({ ...errors, email: error });
    }
  };

  const hasErrors = (errors) => Object.values(errors).some((error) => error);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "username") {
      setErrors((prev) => ({
        ...prev,
        username: value.trim() === "" ? t("username_required") : "",
      }));
    } else if (name === "password") {
      if (value.trim() === "")
        setErrors((prev) => ({ ...prev, password: t("password_required") }));
      else setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    const newErrors = { username: "", password: "" };
    if (formData.username.trim() === "") {
      newErrors.username = t("username_required");
      valid = false;
    }
    if (formData.password.trim() === "") {
      newErrors.password = t("password_required");
      valid = false;
    } else if (formData.password.trim().length < 6) {
      newErrors.password = t("password_min");
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      try {
        setLoading(true);
        const res = await axios.post(`${API_BASE_URL}login`, {
          email: formData.username,
          password: formData.password,
        });
        setToken(res.data.data.token, formData.remember);
        if (res.data.status === 200) {
          toast.success(t("toast_success"), {
            position: "top-center",
            style: { backgroundColor: "green", color: "white" },
            duration: 4000,
          });
        }
        setFormData({
          username: "",
          password: "",
          remember: false,
        });
        login(res.data?.data?.permissions, formData.remember);
        setTimeout(() => {
          if (location.state?.isFromQR) {
            navigate(location.state?.from);
            return;
          }
          navigate("/");
        }, 500);
      } catch (error) {
        setLoading(false);
        toast.error(
          lang === "ar"
            ? splitLang(error.response?.data?.message).ar
            : splitLang(error.response?.data?.message).en || "حدث خطأ",
          {
            position: "top-center",
            style: { backgroundColor: "red", color: "white" },
            duration: 2000,
          }
        );
      }
    } else {
      toast.error(t("toast_error"), {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 4000,
      });
    }
  };

  return (
    <main
      className={styles.auth}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      lang={i18n.language}
    >
      <Model isOpen={isOpen} title={t("modalTtile")} closeModel={close}>
        <form id="emailForm" onSubmit={onSubmitEmail}>
          <div className={styles.formGroup}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handlChangeEmail}
              placeholder={t("emailPlaceholder")}
            />
            <div className={styles.error}>{errors.email}</div>
          </div>
          <div className={styles.actions}>
            <button className={styles.btnCancel} onClick={close} type="button">
              {t("Cancel")}
            </button>
            <button
              disabled={hasErrors(errors) || loading}
              className={styles.btn}
            >
              {" "}
              {!loading ? (
                t("sendCode")
              ) : (
                <>
                  <div className={styles.load}>
                    <ClipLoader size={18} color="#fff" />
                    <span>{t("loading")}</span>
                  </div>
                </>
              )}
            </button>
          </div>
        </form>
      </Model>
      <div className={styles.emailBox}>
        <div className={styles.verificationHeader}>
          <h1>{t("title")}</h1>
          <p className={styles.verificationSubtitle}>{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="username"
              placeholder={t("username_placeholder")}
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <div className={styles.error}>{errors.username}</div>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.passwordGroup}`}>
            <input
              type={showPassword ? "text" : "password"} // 👈 toggle type
              name="password"
              placeholder={t("password_placeholder")}
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && (
              <div className={styles.error}>{errors.password}</div>
            )}
          </div>

          <div className={styles.checkboxContainer}>
            <Link onClick={open} className={styles.forgotPassword}>
              {t("forgot_password")}
            </Link>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              {t("remember_me")}
            </label>
          </div>

          <button
            type="submit"
            className={styles.btn}
            disabled={hasErrors(errors) || loading}
          >
            {!loading ? (
              t("login")
            ) : (
              <div className={styles.load}>
                <span>{t("loading")}</span>
                <ClipLoader size={18} color="#fff" />
              </div>
            )}
          </button>

          <p
            style={{
              marginTop: "0.6rem",
              fontSize: "0.8rem",
              textAlign: "center",
            }}
          >
            {t("no_account")}{" "}
            <Link
              to="/Regiester"
              style={{
                textDecoration: "none",
                color: "#163a63",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {t("create_account")}
            </Link>
          </p>
        </form>
      </div>
      <Toaster />
    </main>
  );
}
