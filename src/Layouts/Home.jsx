import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./style.module.css";
import { Decode_Token, getToken } from "../Utils";
import usePushSubscription from './../Hooks/usePushSubscription';

function Home() {
  const { t, i18n } = useTranslation("home");
  const token=getToken()
  const data=Decode_Token(token)
  
  usePushSubscription(data?.id)

  return (
    <div lang={i18n.language} dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className={styles.hero_section}>
        <div className={styles.hero_background}>
          <div className={styles.hero_overlay}></div>
          <img
            src="/helwan.jpg"
            alt="جامعة حلوان"
            className={styles.hero_bg_image}
          />
        </div>
        <div className={`${styles.container} ${styles.hero_content}`}>
          <div className={styles.hero_text_content}>
            <h1 className={styles.hero_title}>{t("hero_title")}</h1>
            <p className={styles.hero_description}>{t("hero_description")}</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features_section}>
        <div className={styles.container}>
          <div className={styles.section_header}>
            <h2 className={styles.section_title}>{t("features_title")}</h2>
            <p className={styles.section_subtitle}>{t("features_subtitle")}</p>
          </div>

          <div className={styles.features_grid}>
            <Link to="/login" className={styles.feature_card}>
              <h3>{t("feature1_title")}</h3>
              <p>{t("feature1_desc")}</p>
            </Link>

            <Link to="/login" className={styles.feature_card}>
              <h3>{t("feature2_title")}</h3>
              <p>{t("feature2_desc")}</p>
            </Link>

            <Link to="/login" className={styles.feature_card}>
              <h3>{t("feature3_title")}</h3>
              <p>{t("feature3_desc")}</p>
            </Link>

            <Link to="/login" className={styles.feature_card}>
              <h3>{t("feature4_title")}</h3>
              <p>{t("feature4_desc")}</p>
            </Link>

            <Link to="/login" className={styles.feature_card}>
              <h3>{t("feature5_title")}</h3>
              <p>{t("feature5_desc")}</p>
            </Link>

            <Link to="/login" className={styles.feature_card}>
              <h3>{t("feature6_title")}</h3>
              <p>{t("feature6_desc")}</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
