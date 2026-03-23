import React from 'react'
import styles from "./index.module.css";
import StudentsTable from '../Manage-rejected-users/StudentsTable/StudentsTable';
import AllStudentsTable from './Users-table/UsersTable';
function UsersTable() {
    return (
        <div className={styles.page}>
        <AllStudentsTable />
        </div>
    )
}

export default UsersTable
