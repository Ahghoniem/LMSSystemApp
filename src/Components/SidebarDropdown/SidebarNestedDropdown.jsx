import React, { useMemo, useState } from "react";
import styles from "./SidebarNestedDropdown.module.css";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

export default function SidebarNestedDropdown({
  icon: Icon,
  label,
  groups = [],
  onClose,
  Open,
  onClick,
  isOpen = false,
  onToggle,
  onItemClick,
  title,
  collapsed = false,
  t,
}) {
  const { hasPermission } = useAuth();
  const [expandedGroup, setExpandedGroup] = useState(null);

  const groupsWithVisibleItems = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        visibleItems: (group.items || []).filter(
          (item) => !item.permission || hasPermission(item.permission)
        ),
      }))
      .filter((group) => group.visibleItems.length > 0);
  }, [groups, hasPermission]);

  if (groupsWithVisibleItems.length === 0) return null;

  const handleItemClick = () => {
    if (onItemClick) onItemClick();
    if (onClose) onClose();
  };

  const handleMainToggle = () => {
    if (Open && onToggle) {
      onToggle();
      setExpandedGroup(null);
    } else if (onClick) {
      onClick();
    }
  };

  const handleGroupToggle = (groupKey) => {
    setExpandedGroup((prev) => (prev === groupKey ? null : groupKey));
  };

  return (
    <li className={styles.dropdown}>
      <button
        className={`${styles.dropdownHeader} ${collapsed ? styles.collapsed : ""}`}
        onClick={handleMainToggle}
        data-tooltip={title ?? label}
      >
        <div className={styles.labelContainer}>
          {Icon && <Icon className={styles.icon} size={20} />}
          {Open && <span style={{ fontFamily: "Cairo" }}>{label}</span>}
        </div>
        {Open &&
          (isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
      </button>

      <ul className={`${styles.dropdownList} ${isOpen ? styles.open : ""}`}>
        {groupsWithVisibleItems.map((group, groupIndex) => {
          const groupKey = group.labelKey || groupIndex;
          const isGroupOpen = expandedGroup === groupKey;
          const GroupIcon = group.icon;
          return (
            <li key={groupKey} className={styles.groupItem}>
              <button
                type="button"
                className={styles.groupHeader}
                onClick={() => handleGroupToggle(groupKey)}
                title={typeof group.label === "string" ? group.label : t(group.labelKey)}
              >
                {GroupIcon && (
                  <GroupIcon className={styles.groupIcon} size={18} />
                )}
                <span style={{ fontFamily: "Cairo" }}>
                  {typeof group.label === "string" ? group.label : t(group.labelKey)}
                </span>
                {isGroupOpen ? (
                  <ChevronUp size={16} className={styles.groupChevron} />
                ) : (
                  <ChevronRight size={16} className={styles.groupChevron} />
                )}
              </button>
              <ul
                className={`${styles.nestedList} ${isGroupOpen ? styles.nestedOpen : ""}`}
              >
                {group.visibleItems.map((item, index) => (
                  <li key={index} style={{ "--i": index }}>
                    <Link
                      to={item.path}
                      className={styles.dropdownItem}
                      onClick={handleItemClick}
                      state={{ type: item.state ?? null }}
                      title={item.label}
                    >
                      {item.icon && (
                        <item.icon className={styles.subIcon} size={18} />
                      )}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
