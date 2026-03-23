import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import styles from "./Popup.module.css";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const Popup = ({ isOpen, type, message, onClose , hasButtons ,to,warning=false , action,isloading=false}) => {
  const [show, setShow] = useState(false);
  const {t} =useTranslation("register")
  const navigate=useNavigate()
  const Cancel=() => {
    navigate(to)
  }
  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);

  let iconClass = "";
  if (type === "success") iconClass = styles.iconSuccess;
  else if (type === "error") iconClass = styles.iconError;
  else if (type === "warning") iconClass = styles.iconWarning;
  else if (type === "info") iconClass = styles.iconInfo;

  let icon;
  if (type === "success") icon = <CheckCircle className={iconClass} size={48} />;
  else if (type === "error") icon = <XCircle className={iconClass} size={48} />;
  else if (type === "warning") icon = <AlertTriangle className={iconClass} size={48} />;
  else if (type === "info") icon = <Info className={iconClass} size={48} />;

  return (
    <div
      className={`${styles.overlay} ${
        show ? styles.overlayVisible : styles.overlayHidden
      }`}
    >
      <div className={`${styles.popup} ${show ? styles.popupVisible : ""}`}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
        </button>

        {/* Icon */}
        <div className={styles.iconWrapper}>{icon}</div>

        {/* Message */}
        <p className={styles.message}>{message}</p>
      {hasButtons && (
        <div className={styles.actions}>
        <button onClick={warning?action:onClose} disabled={isloading} className={styles.btn}>
          {warning && isloading ? 
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />:
          t("Popup.Continue")
        }
        </button>
        <button onClick={warning?onClose:Cancel} className={styles.btnCancel}>{t("Popup.Cancel")}</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Popup;
