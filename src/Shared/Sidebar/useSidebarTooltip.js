import { useState, useMemo } from "react";

/**
 * Tooltip shown when sidebar is collapsed (portal tooltip on hover).
 * @param {React.RefObject} menuRef - ref to the menu element
 * @param {boolean} isOpen - whether the sidebar is open
 * @returns {{ portalTooltip, handleMenuMouseMove, handleMenuMouseLeave, tooltipStyle }}
 */
export function useSidebarTooltip(menuRef, isOpen) {
  const [portalTooltip, setPortalTooltip] = useState(null);

  const handleMenuMouseMove = (e) => {
    if (isOpen) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const target = el?.closest?.("a[data-tooltip], button[data-tooltip]");
    if (target && menuRef.current?.contains(target)) {
      const rect = target.getBoundingClientRect();
      const label = target.getAttribute("data-tooltip");
      setPortalTooltip({ label, rect });
    } else {
      setPortalTooltip(null);
    }
  };

  const handleMenuMouseLeave = () => setPortalTooltip(null);

  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const tooltipStyle = useMemo(() => {
    if (!portalTooltip) return null;
    return {
      position: "fixed",
      top: portalTooltip.rect.top + portalTooltip.rect.height / 2,
      ...(isRtl
        ? { right: window.innerWidth - portalTooltip.rect.left + 8 }
        : { left: portalTooltip.rect.right + 8 }),
      transform: "translateY(-50%)",
      background: "#6b7280",
      color: "#fff",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      whiteSpace: "nowrap",
      zIndex: 10001,
      pointerEvents: "none",
    };
  }, [portalTooltip, isRtl]);

  return { portalTooltip, handleMenuMouseMove, handleMenuMouseLeave, tooltipStyle };
}
