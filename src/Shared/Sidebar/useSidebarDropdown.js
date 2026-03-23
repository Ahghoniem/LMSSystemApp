import { useState, useEffect } from "react";

/**
 * Manages open dropdown state and close-on-sidebar-close behavior.
 * @param {boolean} isOpen - whether the sidebar is open
 * @returns {{ openDropdowns, handleDropdownToggle, handleItemClick }}
 */
export function useSidebarDropdown(isOpen) {
  const [openDropdowns, setOpenDropdowns] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setOpenDropdowns([]);
    }
  }, [isOpen]);

  const handleDropdownToggle = (dropdownLabel) => {
    setOpenDropdowns((prev) =>
      prev.includes(dropdownLabel)
        ? prev.filter((label) => label !== dropdownLabel)
        : [...prev, dropdownLabel]
    );
  };

  const handleItemClick = () => {
    setOpenDropdowns([]);
  };

  return { openDropdowns, handleDropdownToggle, handleItemClick };
}
