import { Link } from "react-router-dom";
import {
  FaUser,
  FaHome,
  FaChalkboardTeacher,
  FaComments,
  FaFileAlt,
  FaUserCheck,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaRegCalendarAlt,
  FaCalendarCheck,
} from "react-icons/fa";
import styles from "../Sidebar.module.css";

export default function SidebarStudentMenu({
  t,
  isOpen,
  onClose,
  data,
  pro,
  chat,
  onChatClick,
  shouldShowChatBadge,
}) {
  // 🔥 Safe extracted values
  const status = data?.status;
  const courseName = pro?.data?.courseNameEn;
  const hasProduct = !!pro?.data;
  const isExamMaterial = courseName === "Exam+Study_Material";

  return (
    <>
      {/* Home */}
      <li>
        <Link
          to="/"
          onClick={onClose}
          className={styles.navItem}
          data-tooltip={t("home")}
        >
          <FaHome className={styles.icon} size={23} />
          {isOpen && <span>{t("home")}</span>}
        </Link>
      </li>

      {/* Profile */}
      <li>
        <Link
          to="/profile"
          onClick={onClose}
          className={styles.navItem}
          data-tooltip={t("user_data")}
        >
          <FaUser className={styles.icon} />
          {isOpen && <span>{t("user_data")}</span>}
        </Link>
      </li>

      {/* Exams */}
      {hasProduct &&
        (status === "Finish Training" ||
          status === "failed" ||
          (status === "approved" && isExamMaterial)) && (
          <li>
            <Link
              to="/view-All-courses"
              state={{ type: "exam" }}
              onClick={onClose}
              className={styles.navItem}
              data-tooltip={t("exams")}
            >
              <FaRegCalendarAlt className={styles.icon} />
              {isOpen && <span>{t("exams")}</span>}
            </Link>
          </li>
        )}

      {/* Trainings */}
      {hasProduct &&
        !isExamMaterial &&
        (status === "approved" || status === "reserved Training") && (
          <li>
            <Link
              to="/view-All-courses"
              state={{ type: "training" }}
              onClick={onClose}
              className={styles.navItem}
              data-tooltip={t("trainings")}
            >
              <FaRegCalendarAlt className={styles.icon} />
              {isOpen && <span>{t("trainings")}</span>}
            </Link>
          </li>
        )}

      {/* Training Details + Attendance */}
      {hasProduct &&
        !isExamMaterial &&
        (status === "reserved Training" || status === "approved") && (
          <>
            <li>
              <Link
                to="/training-details"
                onClick={onClose}
                className={styles.navItem}
                data-tooltip={t("training_details")}
              >
                <FaChalkboardTeacher className={styles.icon} />
                {isOpen && <span>{t("training_details")}</span>}
              </Link>
            </li>

            <li>
              <Link
                to="/Attendance-details"
                onClick={onClose}
                className={styles.navItem}
                data-tooltip={t("user_Attendance")}
              >
                <FaUserCheck className={styles.icon} />
                {isOpen && <span>{t("user_Attendance")}</span>}
              </Link>
            </li>
          </>
        )}

      {/* Exam Details */}
      {hasProduct &&
        (status === "reserved Exam" ||
          status === "failed" ||
          status === "reserved Reexam" ||
          (isExamMaterial && status === "approved") ||
          status === "Finish Training") && (
          <li>
            <Link
              to="/exam-details"
              onClick={onClose}
              className={styles.navItem}
              data-tooltip={t("exam_details")}
            >
              <FaFileAlt className={styles.icon} />
              {isOpen && <span>{t("exam_details")}</span>}
            </Link>
          </li>
        )}

      {/* Results */}
      {(status === "failed" ||
        status === "succeeded" ||
        status === "reserved Reexam") && (
        <li>
          <Link
            to="/exam-results"
            onClick={onClose}
            className={styles.navItem}
            data-tooltip={t("results")}
          >
            <FaClipboardCheck className={styles.icon} />
            {isOpen && <span>{t("results")}</span>}
          </Link>
        </li>
      )}

      <li>
        <Link
          to="/registered-events"
          onClick={onClose}
          className={styles.navItem}
          data-tooltip={t("registered_events")}
        >
          <FaCalendarCheck className={styles.icon} />
          {isOpen && <span>{t("registered_events")}</span>}
        </Link>
      </li>

      {/* Pay Fees */}
      <li>
        <Link
          to="/pay-fees"
          onClick={onClose}
          className={styles.navItem}
          data-tooltip={t("pay_fees")}
        >
          <FaMoneyBillWave className={styles.icon} size={23} />
          {isOpen && <span>{t("pay_fees")}</span>}
        </Link>
      </li>

      {/* Chat */}
      <li>
        <Link
          to="/User-chats"
          onClick={onChatClick}
          className={styles.navItem}
          data-tooltip={t("chat")}
        >
          <FaComments className={styles.icon} size={23} />
          {isOpen && <span>{t("chat")}</span>}

          {chat > 0 && shouldShowChatBadge() && (
            <span className="absolute w-5 h-5 bg-[#b38e19] rounded-full flex items-center justify-center text-white text-xs animate-pulse">
              {chat}
            </span>
          )}
        </Link>
      </li>
    </>
  );
}
