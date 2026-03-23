import React from 'react'
import styles from './Courses.module.css'
import { courses } from '../data'
import CourseCard from '../../../../Components/CourseCard/CourseCard'

const Courses = () => {
  return (
    <div className={styles.app}>
      <main className={styles.content}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>تفاصيل الحزمة</h1>
          <div className={styles.cardsGrid} role="list">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Courses
