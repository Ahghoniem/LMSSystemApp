import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { FaBars, FaTimes } from "react-icons/fa"; // ✅ Added bell icon
import { Decode_Token, deleteToken, getRelatedMessages, getToken } from "../Utils";
import { useWebSocket } from "../Hooks/useWebSocket";
import { API_BASE_URL, WEB_SOCKET_URL } from "../Constants";
import { useFetchData } from "../Hooks/UseFetchData";

export default function Navbar({ sendDataToParent, logout }) {
  const { t, i18n } = useTranslation("navbar");
  const navigate = useNavigate();
  const token = getToken();
  const data=Decode_Token(token)
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownRefMobile = useRef(null);
  const [messages] =useWebSocket(WEB_SOCKET_URL,data?.id)
  const [isCleared, setIsCleared] = useState(false);
  const { data: count } = useFetchData({
      baseUrl: `${API_BASE_URL}notifications/count/${data?.id}`,
      queryKey: ["NotifiCount"],
      token,
      options: {
        enabled: data?.role === "STUDENT",
      },
    });

    const notifies = useMemo(() => {
      if (!data?.id || messages.length === 0){
        messages.length =0
        return []
      };
      return getRelatedMessages(messages, data.id);
    }, [messages, data?.id]);
    useEffect(() => {
      if (notifies.length > 0) {
        setIsCleared(false);
      }
    }, [notifies]);

    const notificationCount = useMemo(() => {
      if (isCleared) {
        return 0
      };
      const socketCount = Array.isArray(notifies) ? notifies.length : 0;
      const apiCount = Number(count?.data?.res) || 0;
      return socketCount + apiCount;
    }, [notifies, count, isCleared]);
    
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    sessionStorage.setItem("lang", lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    setIsMenuOpen(false);
  };

  const Logout = () => {
    deleteToken();
    logout();
    navigate("/login");
  };
  const viewNotifies=() => {
    setIsCleared(true); 
    messages.length=0
    navigate("/notifications")
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownRefMobile.current &&
        !dropdownRefMobile.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentFlag =
    i18n.language === "ar"
      ? "/icons/egypt-flag-icon.svg"
      : "/icons/united-states-flag-icon.svg";


  return (
    <>
      <nav className={styles.navbar} dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        {/* Left Section (Sidebar Toggle) */}
        <div className={styles.navbarLeft}>
          {token && (
            <button
              className={styles.sidebarToggle}
              data-sidebar-toggle
              onClick={() => sendDataToParent(true)}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <FaTimes size={22} /> : <FaBars size={26} />}
            </button>
          )}
        </div>

        {/* Center Logo */}
        <div className={token ? styles.navbarCenter : styles.navbarMain}>
          <img
            src="/images.png"
            className={styles.logo}
            onClick={() => navigate("/")}
            alt="Helwan University Logo"
          />
        </div>

        {/* Right Section */}
        <div className={styles.desktopMenu} style={token && { display: "flex" }}>
          {token && data.role ==="STUDENT"   &&(
             <button onClick={viewNotifies} className={styles.notifBell}>
             <i className="fa-solid fa-bell"></i>
             <span className={styles.notifCount} style={{display:isCleared || notificationCount===0 ?"none":null}}>{notificationCount}</span>
           </button>
          )}

          {/* 🌍 Language Dropdown */}
          <div ref={dropdownRef}>
            <button
              className={styles.flag}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img src={currentFlag} alt="current language" />
            </button>
            {isMenuOpen && (
              <div className={styles.flagDropdown}>
                <div
                  className={styles.dropdownItem}
                  onClick={() => changeLanguage("en")}
                >
                  <img src="/icons/united-states-flag-icon.svg" alt="English" />
                  <span>{t("english")}</span>
                </div>
                <div
                  className={styles.dropdownItem}
                  onClick={() => changeLanguage("ar")}
                >
                  <img src="/icons/egypt-flag-icon.svg" alt="Arabic" />
                  <span>{t("arabic")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Auth Buttons */}
          {!token && (
            <>
              <Link className="nav-signup" to="/Regiester">
                {t("signup")}
              </Link>
              <Link className="nav-login" to="/login">
                {t("login")}
              </Link>
            </>
          )}

          {token && (
            <button onClick={Logout} className={styles.logoutText}>
              {t("logout")}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {!token && (
          <>
            <div className={styles.mobileToggle}>
              <div ref={dropdownRefMobile}>
            <button
              className={styles.flag}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img src={currentFlag} alt="current language" />
            </button>
            {isMenuOpen && (
              <div className={styles.flagDropdown}>
                <div
                  className={styles.dropdownItem}
                  onClick={() => changeLanguage("en")}
                >
                  <img src="/icons/united-states-flag-icon.svg" alt="English" />
                  <span>{t("english")}</span>
                </div>
                <div
                  className={styles.dropdownItem}
                  onClick={() => changeLanguage("ar")}
                >
                  <img src="/icons/egypt-flag-icon.svg" alt="Arabic" />
                  <span>{t("arabic")}</span>
                </div>
              </div>
            )}
          </div>
              <button
                className={styles.menuBtn}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  className={styles.icon}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ""}`}>
              <Link
                className="nav-signup"
                onClick={() => setIsOpen(false)}
                to="/Regiester"
              >
                {t("signup")}
              </Link>
              <Link
                className="nav-login"
                onClick={() => setIsOpen(false)}
                to="/login"
              >
                {t("login")}
              </Link>
            </div>
          </>
        )}
      </nav>
    </>
  );
}
