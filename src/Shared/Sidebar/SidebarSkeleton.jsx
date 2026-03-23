import styles from "../Sidebar.module.css";

export default function SidebarSkeleton({ isOpen }) {
  return (
    <div className={styles.sidebarSkeleton}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className={styles.skeletonItem}>
          <div className={styles.skeletonIcon}></div>
          {isOpen && <div className={styles.skeletonText}></div>}
        </div>
      ))}
    </div>
  );
}