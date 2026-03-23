import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Sidebar.module.css";
import { useTranslation } from "react-i18next";
import { Decode_Token, getToken } from "../Utils";
import { useFetchData } from "../Hooks/UseFetchData";
import { API_BASE_URL, WEB_SOCKET_URL } from "../Constants";
import { useWebSocket } from "../Hooks/useWebSocket";

import { useSidebarDropdown } from "./Sidebar/useSidebarDropdown";
import { useSidebarTooltip } from "./Sidebar/useSidebarTooltip";
import SidebarHeader from "./Sidebar/SidebarHeader";
import SidebarStudentMenu from "./Sidebar/SidebarStudentMenu";
import SidebarAdminMenu from "./Sidebar/SidebarAdminMenu";
import SidebarTrainerMenu from "./Sidebar/SidebarTrainerMenu";
import SidebarSupervisorMenu from "./Sidebar/SidebarSupervisorMenu";
import SidebarSuperadminMenu from "./Sidebar/SidebarSuperadminMenu";
import SidebarSkeleton from "./Sidebar/SidebarSkeleton";

export default function Sidebar({ isOpen, onClose, sendDataToParent }) {
  const token = getToken();
  const data = Decode_Token(token);
  const location = useLocation();
  const isChatPage =
    (location.pathname === "/trainer-chats" && data.role === "TRAINER") ||
    (location.pathname === "/User-chats" && data.role === "STUDENT");

  const { t } = useTranslation("sidebar");
  const [, , chat, setChat] = useWebSocket(WEB_SOCKET_URL, data?.id);
  const { data: pro, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}products/${data?.productId}`,
    queryKey: ["pros"],
    token,
    options: { enabled: data.role === "STUDENT" },
  });

  const menuRef = useRef(null);
  const sidebarRef = useRef(null);
  const { openDropdowns, handleDropdownToggle, handleItemClick } =
    useSidebarDropdown(isOpen);
  const {
    portalTooltip,
    handleMenuMouseMove,
    handleMenuMouseLeave,
    tooltipStyle,
  } = useSidebarTooltip(menuRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      const isInsideSidebar = sidebarRef.current?.contains(event.target);
      const isOnSidebarToggle = event.target.closest?.("[data-sidebar-toggle]");
      if (!isInsideSidebar && !isOnSidebarToggle) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleChatClick = () => {
    onClose();
    setChat(0);
  };

  const shouldShowChatBadge = () => {
    if (isChatPage) {
      setChat(0);
      return false;
    }
    return true;
  };

  return (
    <aside
      ref={sidebarRef}
      className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
    >
      <SidebarHeader isOpen={isOpen} onClose={onClose} userData={data} />
      <ul
        ref={menuRef}
        className={`${styles.menu} ${!isOpen ? styles.menuClosed : ""}`}
        onMouseMove={handleMenuMouseMove}
        onMouseLeave={handleMenuMouseLeave}
      >
        {data.role === "STUDENT" && isLoading && (
          <SidebarSkeleton isOpen={isOpen} />
        )}

        {data.role === "STUDENT" && !isLoading && (
          <SidebarStudentMenu
            t={t}
            isOpen={isOpen}
            onClose={onClose}
            data={data}
            pro={pro}
            chat={chat}
            onChatClick={handleChatClick}
            shouldShowChatBadge={shouldShowChatBadge}
          />
        )}
        {data.role === "ADMIN" && (
          <SidebarAdminMenu
            t={t}
            isOpen={isOpen}
            onClose={onClose}
            sendDataToParent={sendDataToParent}
            openDropdowns={openDropdowns}
            handleDropdownToggle={handleDropdownToggle}
            handleItemClick={handleItemClick}
          />
        )}
        {data.role === "TRAINER" && (
          <SidebarTrainerMenu
            t={t}
            isOpen={isOpen}
            onClose={onClose}
            sendDataToParent={sendDataToParent}
            openDropdowns={openDropdowns}
            handleDropdownToggle={handleDropdownToggle}
            handleItemClick={handleItemClick}
            onChatClick={handleChatClick}
            chat={chat}
            shouldShowChatBadge={shouldShowChatBadge}
          />
        )}
        {data.role === "SUPERADMIN" && (
          <SidebarSuperadminMenu
            t={t}
            isOpen={isOpen}
            onClose={onClose}
            sendDataToParent={sendDataToParent}
            openDropdowns={openDropdowns}
            handleDropdownToggle={handleDropdownToggle}
            handleItemClick={handleItemClick}
          />
        )}
        {data.role === "SUPERVISOR" && (
          <SidebarSupervisorMenu
            t={t}
            isOpen={isOpen}
            onClose={onClose}
            sendDataToParent={sendDataToParent}
            openDropdowns={openDropdowns}
            handleDropdownToggle={handleDropdownToggle}
            handleItemClick={handleItemClick}
            onChatClick={handleChatClick}
            chat={chat}
            shouldShowChatBadge={shouldShowChatBadge}
          />
        )}
      </ul>
      {portalTooltip?.label &&
        createPortal(
          <div style={tooltipStyle} role="tooltip">
            {portalTooltip.label}
          </div>,
          document.body
        )}
    </aside>
  );
}
