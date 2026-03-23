import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Footer.module.css";

const Footer = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const { t } = useTranslation("footer");

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className={styles.site_footer}>
      <div className={styles.footer_content}>
        <p>© {year} {t("rights")}</p>
      </div>
    </footer>
  );
};

export default Footer;
