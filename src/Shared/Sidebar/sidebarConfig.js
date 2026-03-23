import { Receipt } from "lucide-react";
import {
  FaUser,
  FaUserTimes,
  FaUsers,
  FaUserTie,
  FaUserShield,
  FaUserCog,
  FaUserGraduate,
  FaPlusCircle,
  FaCalendarPlus,
  FaCalendarAlt,
  FaBox,
  FaBoxes,
  FaMoneyBillWave,
  FaLayerGroup,
  FaServer,
  FaBoxOpen,
  FaFileAlt,
  FaShieldAlt,
  FaTag,
  FaReceipt,
} from "react-icons/fa";

/**
 * User management nested dropdown groups (trainees, trainers, supers, admins).
 * @param {string} basePath - e.g. "/admin", "/trainer"
 * @param {string|null} traineePath - optional override for trainee links (e.g. superadmin uses "/admin")
 * @param {function} t - translation function
 */
export function getUserManagementGroups(basePath, traineePath, t) {
  const p = traineePath ?? basePath;
  return [
    {
      labelKey: "traniees",
      icon: FaUserGraduate,
      items: [
        { label: t("traniee"), path: `${p}/manage-users`, icon: FaUser, permission: "VIEW_USER" },
        { label: t("rejected"), path: `${p}/rejected-users`, icon: FaUserTimes, permission: "ACCEPT_USER" },
      ],
    },
    {
      labelKey: "trainers",
      icon: FaUsers,
      items: [
        { label: t("manageTrainer"), state: "trainer", path: `${basePath}/manage-team`, icon: FaUserTie, permission: "VIEW_TRAINER" },
        { label: t("addTrainer"), state: "trainer", path: `${basePath}/add-trainer`, icon: FaPlusCircle, permission: "ADD_TRAINER" },
      ],
    },
    {
      labelKey: "supers",
      icon: FaUserShield,
      items: [
        { label: t("manageSuper"), state: "super", path: `${basePath}/manage-team`, icon: FaUserTie, permission: "VIEW_SUPERVISOR" },
        { label: t("addSuper"), state: "super", path: `${basePath}/add-trainer`, icon: FaPlusCircle, permission: "ADD_SUPERVISOR" },
      ],
    },
    {
      labelKey: "admins",
      icon: FaUserCog,
      items: [
        { label: t("manageAdmin"), state: "Admin", path: `${basePath}/manage-team`, icon: FaUserTie, permission: "VIEW_ADMIN" },
        { label: t("addAdmin"), state: "Admin", path: `${basePath}/add-trainer`, icon: FaPlusCircle, permission: "ADD_ADMIN" },
      ],
    },
  ];
}

/**
 * Common dropdown configs (events, packages, finance, course, products, services) by basePath.
 * @param {string} basePath - e.g. "/admin", "/trainer"
 * @param {function} t - translation function
 */
export function getCommonDropdownConfig(basePath, t) {
  return {
    events: {
      label: t("events"),
      title: t("events"),
      icon: FaCalendarPlus,
      items: [
        { label: t("add_event"), path: `${basePath}/AddEvents`, icon: FaCalendarPlus, permission: "ADD_EVENT" },
        { label: t("manage_events"), path: `${basePath}/manage-events`, icon: FaCalendarAlt, permission: "VIEW_EVENT" },
      ],
    },
    packages: {
      label: t("packages"),
      title: t("packages"),
      icon: FaBox,
      items: [
        { label: t("ManagePacks"), path: `${basePath}/manage-packages`, icon: FaBoxes, permission: "VIEW_PACKAGE" },
        { label: t("addPack"), path: `${basePath}/Add-package`, icon: FaPlusCircle, permission: "ADD_PACKAGE" },
      ],
    },
    finance: {
      label: t("finance"),
      title: t("finance"),
      icon: FaMoneyBillWave,
      items: [
        { label: t("finance_management"), path: `${basePath}/finance-management`, icon: FaMoneyBillWave , permission:"VIEW_FINANCE" },
        { label: t("receipt_management"), path: `${basePath}/receipts-management`, icon: FaReceipt , permission:"VIEW_FINANCE" },
      ],
    },
    course: {
      label: t("course"),
      title: t("course"),
      icon: FaLayerGroup,
      items: [
        { label: t("manageCourses"), path: `${basePath}/manage-courses`, icon: FaServer, permission: "VIEW_COURSE" },
        { label: t("addCourse"), path: `${basePath}/add-course`, icon: FaPlusCircle, permission: "ADD_COURSE" },
      ],
    },
    products: {
      label: t("products"),
      title: t("products"),
      icon: FaTag,
      items: [
        { label: t("manageProducts"), path: `${basePath}/manage-products`, icon: FaBoxOpen, permission: "VIEW_PRODUCT" },
        { label: t("addProduct"), path: `${basePath}/add-product`, icon: FaPlusCircle, permission: "ADD_PRODUCT" },
      ],
    },
    services: {
      label: t("services"),
      title: t("services"),
      icon: FaBoxOpen,
      items: [
        { label: t("manageServices"), path: `${basePath}/manage-services`, icon: FaBoxOpen ,permission:"VIEW_SERVICES" },
        { label: t("addService"), path: `${basePath}/add-service`, icon: FaPlusCircle,permission:"ADD_SERVICE" },
      ],
    },
  };
}

/** Permissions management dropdown (superadmin only). */
export function getPermissionsDropdownConfig(basePath, t) {
  return {
    label: t("permissions_management"),
    title: t("permissions_management"),
    icon: FaShieldAlt,
    items: [
      { label: t("permission_files"), path: `${basePath}/permission-files`, icon: FaFileAlt },
      { label: t("add_permission_file"), path: `${basePath}/add-permission-file`, icon: FaPlusCircle },
      { label: t("users_permissions"), path: `${basePath}/users-permissions`, icon: FaUserShield },
    ],
  };
}
