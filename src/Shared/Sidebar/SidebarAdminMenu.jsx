import SidebarDropdownRow from "./SidebarDropdownRow";

const BASE = "/admin";

export default function SidebarAdminMenu({
  t,
  isOpen,
  onClose,
  sendDataToParent,
  openDropdowns,
  handleDropdownToggle,
  handleItemClick,
}) {
  return (
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
        showDashboard: true,
        dashboardPath: `${BASE}/dashboard`,
        showProfile: true,
        profilePath: `${BASE}/profile`,
        showCertificate: true,
        certificatePath: `${BASE}/statement-requests`,
      }}
    />
  );
}
