import React, { useMemo } from "react";
import styles from "./SidebarDropdown.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

export default function SidebarDropdown({
  icon: Icon,
  label,
  items = [],
  onClose,
  Open,
  onClick,
  isOpen = false,
  onToggle,
  onItemClick,
  title,
  collapsed = false,
}) {

  const { hasPermission } = useAuth();

  const visibleItems = useMemo(
    () => items.filter(item => !item.permission || hasPermission(item.permission)),
    [items, hasPermission]
  );


  if (visibleItems.length === 0) return null;
  
  const handleItemClick = () => {
    if (onItemClick) onItemClick();
    if (onClose) onClose();
  };

  const handleToggle = () => {
    if (Open && onToggle) {
      onToggle();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <li className={styles.dropdown}>
      <button
        className={`${styles.dropdownHeader} ${collapsed ? styles.collapsed : ""}`}
        onClick={handleToggle}
        data-tooltip={title ?? label}
      >
        <div className={styles.labelContainer} >
          {Icon && <Icon className={styles.icon} size={20} />}
          {Open && <span style={{ fontFamily: "Cairo" }}>{label}</span>}
        </div>
        {Open &&
          (isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
      </button>

      <ul className={`${styles.dropdownList} ${isOpen ? styles.open : ""}`}>
        {visibleItems.map((item, index) => (
          <li key={index} style={{ "--i": index }}>
            <Link
              to={item.path}
              className={styles.dropdownItem}
              onClick={handleItemClick}
              state={{type:item.state?item.state:null}}
              title={item.label}
            >
              {item.icon && <item.icon className={styles.subIcon} size={18} />}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
