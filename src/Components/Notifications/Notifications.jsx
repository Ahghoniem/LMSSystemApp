import React from "react";
import styles from "./Notifications.module.css";
import { formatDateTime, splitLang } from "../../Utils";

export default function Notifications({ notifications, iconMapping, t, lang }) {
  return (
    <div className={styles.notifWrap}>
      <div className={styles.notifHeader}>
        <h2>{t("title")}</h2>
      </div>

      {notifications.length === 0 ? (
        <div className={styles.noNotifCard}>
        <div className={styles.noNotif}>
          <i className="fa-regular fa-bell-slash"></i>
          <h3>{t("noNotificationsTitle")}</h3>
          <p>{t("noNotificationsDesc")}</p>
        </div>
      </div>
      ) : (
        <ul className={styles.notifList}>
          {notifications.map((notif, index) => (
            <li key={index} className={styles.notifItem}>
              <div className={styles.headerSec}>
                <p className={styles.notifTime}>{formatDateTime(notif.createdAt, lang)}</p>
                <div className={styles.notifIcon}>
                  <i className={iconMapping[notif.type] || "fa-solid fa-bell"}></i>
                </div>
              </div>

              <div className={styles.notifBody}>
                <div className={styles.notifTitle}>
                  {lang === "ar" ? splitLang(notif.name).ar : splitLang(notif.name).en}
                </div>
                <div className={styles.notifMeta}>
                  <i className={notif.metaIcon}></i>{" "}
                  {lang === "ar"
                    ? splitLang(notif.description).ar
                    : splitLang(notif.description).en}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
