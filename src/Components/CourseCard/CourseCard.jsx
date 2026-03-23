import React from 'react'
import { Link } from 'react-router-dom'
import styles from './CourseCard.module.css'

const CourseCard = ({ course }) => {
  const { id, title, description, icon, } = course
  console.log(title);
  

  return (
    <article className={styles.courseCard} role="listitem">
      <i className={`fa-solid ${icon} ${styles.cardIcon}`} aria-hidden="true"></i>

      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.cardDesc}>{description}</p>

      <div className={styles.cardMeta}>
        {/* <span className={`${styles.metaItem} ${styles.weeks}`}>
          <i className="fa-solid fa-calendar-week"></i>
          <span>{weeks} أسابيع</span>
        </span> */}

        <span className={`${styles.metaItem} ${styles.level}`}>
          {/* <span
            className={`${styles.levelBadge} ${styles[`level--${level}`]}`}
            aria-label={levelText}
          >
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
          </span> */}
          {/* <span className={styles.levelText}>{levelText}</span> */}
        </span>
      </div>

      <Link to={`/course/${id}`} className={styles.btnPrimary}>عرض التفاصيل</Link>
    </article>
  )
}

export default CourseCard
