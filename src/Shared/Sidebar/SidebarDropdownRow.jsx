import { Link } from "react-router-dom";
import SidebarDropdown from "../../Components/SidebarDropdown/SidebarDropdown";
import SidebarNestedDropdown from "../../Components/SidebarDropdown/SidebarNestedDropdown";
import HasPermission from "../../Components/Permissions/HasPermission";
import { getUserManagementGroups, getCommonDropdownConfig } from "./sidebarConfig";
import { FaUsers, FaFileInvoice, FaUserCircle } from "react-icons/fa";
import { LayoutDashboard } from "lucide-react";
import styles from "../Sidebar.module.css";

/**
 * Renders the shared dropdown row (user management + events, packages, finance, course, products, services) + optional dashboard/profile/certificate.
 * Used by Admin, Trainer, Supervisor with different basePath and options.
 */
export default function SidebarDropdownRow({
  basePath,
  t,
  isOpen,
  onClose,
  sendDataToParent,
  openDropdowns,
  handleDropdownToggle,
  handleItemClick,
  options = {},
}) {
  const {
    showDashboard = false,
    dashboardPath,
    showProfile = false,
    profilePath,
    showCertificate = true,
    certificatePath,
    traineePath = null,
  } = options;

  const config = getCommonDropdownConfig(basePath, t);
  const userManagementGroups = getUserManagementGroups(basePath, traineePath, t);

  const dropdownProps = (key) => ({
    Open: isOpen,
    collapsed: !isOpen,
    onClose,
    onClick: () => sendDataToParent?.(true),
    onItemClick: handleItemClick,
    isOpen: openDropdowns.includes(t(key)),
    onToggle: () => handleDropdownToggle(t(key)),
  });

  return (
    <>
      {showDashboard && dashboardPath && (
        <li>
          <Link
            to={dashboardPath}
            onClick={onClose}
            className={styles.navItem}
            data-tooltip={t("dashboard")}
          >
            <LayoutDashboard size={24} className={styles.icon} />
            {isOpen && <span>{t("dashboard")}</span>}
          </Link>
        </li>
      )}
      {showProfile && profilePath && (
          <li>
            <Link
              to={profilePath}
              onClick={onClose}
              className={styles.navItem}
              data-tooltip={t("user_data")}
            >
              <FaUserCircle className={styles.icon} />
              {isOpen && <span>{t("user_data")}</span>}
            </Link>
          </li>
      )}
      <SidebarNestedDropdown
        label={t("user_management")}
        icon={FaUsers}
        title={t("user_management")}
        groups={userManagementGroups}
        t={t}
        {...dropdownProps("user_management")}
      />
      <SidebarDropdown {...config.events} {...dropdownProps("events")} />
      <SidebarDropdown {...config.packages} {...dropdownProps("packages")} />
      <SidebarDropdown {...config.finance} {...dropdownProps("finance")} />
      <SidebarDropdown {...config.course} {...dropdownProps("course")} />
      <SidebarDropdown {...config.products} {...dropdownProps("products")} />
      <SidebarDropdown {...config.services} {...dropdownProps("services")} />
      {showCertificate && certificatePath && (
        <HasPermission permission={"VIEW_STATEMENTS"}>
          <li>
          <Link
            to={certificatePath}
            onClick={onClose}
            className={styles.navItem}
            data-tooltip={t("certificate")}
          >
            <FaFileInvoice className={styles.icon} size={23} />
            {isOpen && <span>{t("certificate")}</span>}
          </Link>
        </li>
        </HasPermission>
      )}
    </>
  );
}
