import React from "react";
import styles from "../RegisterForm.module.css";

export default function Step4Account({ t ,formValues,handlInputChange,errors}) {
  return (
    <div className={styles.formStep}>
     <div>
     <input
        type="tel"
        name="Mobile"
        className="rounded-md"
        pattern="01[0-9]{9}"
        placeholder={t("account.phone")}
        value={formValues.Mobile}
        onChange={handlInputChange}
      />
       {errors.Mobile && <span className={styles.error}>{errors.Mobile}</span>}
     </div>
     <div>
     <input
        type="password"
        name="password"
        className="rounded-md"
        placeholder={t("account.password")}
        value={formValues.password}
        onChange={handlInputChange}
      />
      {errors.password && <span className={styles.error}>{errors.password}</span>}
     </div>
      <div>
      <input
        type="password"
        name="confirmPassword"
        className="rounded-md"
        placeholder={t("account.confirm_password")}
        value={formValues.confirmPassword}
        onChange={handlInputChange}
      />
      {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
      </div>
    </div>
  );
}
