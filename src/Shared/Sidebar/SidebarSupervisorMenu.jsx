import { Link } from "react-router-dom";
import { FaHome, FaChalkboardTeacher, FaComments, FaUserCircle } from "react-icons/fa";
import HasPermission from "../../Components/Permissions/HasPermission";
import SidebarDropdownRow from "./SidebarDropdownRow";
import styles from "../Sidebar.module.css";

const BASE = "/supervisor";

export default function SidebarSupervisorMenu({
  t,
  isOpen,
  onClose,
  sendDataToParent,
  openDropdowns,
  handleDropdownToggle,
  handleItemClick,
  onChatClick,
  chat,
  shouldShowChatBadge,
}) {
  return (
    <>
      <li>
        <Link to={`${BASE}/dashboard`} onClick={onClose} className={styles.navItem} data-tooltip={t("home")}>
          <FaHome className={styles.icon} size={23} />
          {isOpen && <span>{t("home")}</span>}
        </Link>
      </li>
        <li>
          <Link
            to={`${BASE}/profile`}
            onClick={onClose}
            className={styles.navItem}
            data-tooltip={t("user_data")}
          >
            <FaUserCircle className={styles.icon} />
            {isOpen && <span>{t("user_data")}</span>}
          </Link>
        </li>
      <li>
        <Link
          to={`${BASE}/manage-exams`}
          onClick={onClose}
          className={styles.navItem}
          data-tooltip={t("manage_exams")}
        >
          <FaChalkboardTeacher className={styles.icon} />
          {isOpen && <span>{t("manage_exams")}</span>}
        </Link>
      </li>
      <li>
        <Link
          to={`${BASE}/supervisor-chats`}
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
      <SidebarDropdownRow
        basePath={BASE}
        t={t}
        isOpen={isOpen}
        onClose={onClose}
        sendDataToParent={sendDataToParent}
        openDropdowns={openDropdowns}
        handleDropdownToggle={handleDropdownToggle}
        handleItemClick={handleItemClick}
        options={{
          showDashboard: false,
          showProfile: false,
          showCertificate: true,
          certificatePath: `${BASE}/statement-requests`,
        }}
      />
    </>
  );
}
