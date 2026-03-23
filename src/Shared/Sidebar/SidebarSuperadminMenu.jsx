import { Link } from "react-router-dom";
import { FaHome, FaUserCircle, FaFileInvoice, FaHistory, FaUsers } from "react-icons/fa";
import SidebarDropdown from "../../Components/SidebarDropdown/SidebarDropdown";
import SidebarNestedDropdown from "../../Components/SidebarDropdown/SidebarNestedDropdown";
import {
  getUserManagementGroups,
  getCommonDropdownConfig,
  getPermissionsDropdownConfig,
} from "./sidebarConfig";
import styles from "../Sidebar.module.css";
import { MonitorCog } from "lucide-react";
import HasPermission from './../../Components/Permissions/HasPermission';

const BASE = "/superadmin";

export default function SidebarSuperadminMenu({
  t,
  isOpen,
  onClose,
  sendDataToParent,
  openDropdowns,
  handleDropdownToggle,
  handleItemClick,
}) {
  const config = getCommonDropdownConfig(BASE, t);
  const permissionsConfig = getPermissionsDropdownConfig(BASE, t);
  const userManagementGroups = getUserManagementGroups(BASE, "/superadmin", t);

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
      <li>
        <Link
          to={`${BASE}/dashboard`}
          onClick={onClose}
          className={styles.navItem}
          data-tooltip={t("home")}
        >
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
      <SidebarDropdown {...config.course} {...dropdownProps("course")} />
      <SidebarDropdown {...config.products} {...dropdownProps("products")} />
      <SidebarDropdown {...config.services} {...dropdownProps("services")} />
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
      <SidebarDropdown {...permissionsConfig} {...dropdownProps("permissions_management")} />
      <HasPermission permission={"VIEW_STATEMENTS"}>
      <li>
        <Link
          to={`${BASE}/statement-requests`}
          onClick={onClose}
          className={styles.navItem}
          data-tooltip={t("certificate")}
        >
          <FaFileInvoice className={styles.icon} size={23} />
          {isOpen && <span>{t("certificate")}</span>}
        </Link>
      </li>
      </HasPermission>
      <li>
        <Link
          to={`${BASE}/system-logs`}
          onClick={onClose}
          className={styles.navItem}
          data-tooltip={t("logs")}
        >
          <FaHistory className={styles.icon} size={23} />
          {isOpen && <span>{t("logs")}</span>}
        </Link>
      </li>
      <li>
        <Link
          to={`${BASE}/system-data`}
          onClick={onClose}
          className={styles.navItem}
          data-tooltip={t("systemData")}
        >
          <MonitorCog className={styles.icon} size={23} />
          {isOpen && <span>{t("systemData")}</span>}
        </Link>
      </li>
    </>
  );
}
