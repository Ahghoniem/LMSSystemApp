import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { capitalizeFirst, getLang } from "../../Utils";
import styles from "../Sidebar.module.css";

export default function SidebarHeader({ isOpen, onClose, userData }) {
  const { t } = useTranslation("sidebar");
  const lang = getLang();
  const name = userData?.email?.split("@") ?? [];
  const displayName =
    lang === "ar" && userData?.name
      ? userData.name
      : lang !== "ar" && userData?.name
        ? userData.NameEn
        : capitalizeFirst(name[0] ?? "");

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.sidebar_header}>
        <div className={styles.head}>
          <div>
            <p className={styles.welcome_text}>{t("welcome_back")}</p>
            <p className={styles.username}>{displayName}</p>
          </div>
          <button onClick={onClose} className={styles.close} type="button" aria-label="Close sidebar">
            <X />
          </button>
        </div>
      </div>
      <hr className={styles.hr} />
    </>
  );
}
