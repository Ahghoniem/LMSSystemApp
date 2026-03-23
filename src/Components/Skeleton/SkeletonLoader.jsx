import React from "react";
import styles from "./SkeletonLoader.module.css";

export default function SkeletonLoader({ rows }) {
  return (
    <table className={styles.skeletonTable}>
      <tbody>
        {Array.from({ length: rows }).map((_, idx) => (
          <tr key={idx}>
            <td><div className={styles.skeleton} /></td>
            <td><div className={styles.skeleton} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
