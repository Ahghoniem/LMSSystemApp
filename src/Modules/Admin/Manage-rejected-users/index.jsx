import React from 'react'
import styles from "./index.module.css";
import StudentsTable from './StudentsTable/StudentsTable';
function RejectedUsersTable() {
    return (
        <div className={styles.page}>
        <StudentsTable />
        </div>
    )
}

export default RejectedUsersTable
