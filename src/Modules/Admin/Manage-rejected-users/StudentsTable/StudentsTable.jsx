import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Filters from "../../../../Components/Filters/Filters";
import Table from "../../../../Components/Table/Table";
import Pagination from "../../../../Components/Paginator/Pagination";
import SkeletonLoader from "../../../../Components/Skeleton/SkeletonLoader";
import styles from "./StudentsTable.module.css";
import StudentDetailsModal from "../StudentDetailsModal/StudentDetailsModal";
import { useFetchData } from "../../../../Hooks/UseFetchData";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../../Constants";
import { addOneDay, formatDateOnly, getToken } from "../../../../Utils";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../../Constants/axiosInstance";
import { useDebounce } from "../../../../Hooks/useDebounce";
import DynamicFilters from "../../../../Components/Filters2";
import { CollageSearch, uniSearch } from "./SearchOptions";
import HasPermission from "../../../../Components/Permissions/HasPermission";

export default function StudentsTable() {
  const { t } = useTranslation("rejected");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading,setLoading]=useState(false)
  const[editLoading,setEditLoading]=useState(false)
  const token = getToken();
  const [users,setUsers]=useState(1)
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  
    const debouncedFilters = useDebounce(filterValues, 500);

    const queryFilters = useMemo(() => {
      const cleaned = Object.fromEntries(
        Object.entries(debouncedFilters).filter(
          ([, v]) => v !== "" && v !== undefined
        )
      );
      if (cleaned["createdAt[lte]"]) {
        cleaned["createdAt[lte]"] = addOneDay(cleaned["createdAt[lte]"]);
      }
      return cleaned;
    }, [debouncedFilters]);
    
    

  const { data, isLoading  } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/usersManagment/byStatus/pending`,
    queryKey: ["RejectedUsers",queryFilters,users],
    token,
    params:queryFilters
  });

  const {data:universties}=useFetchData({
      baseUrl:`${API_BASE_URL}universities`,
      queryKey:["unis"],
      params:{limit:100}
    })
    
  const {data:colls}=useFetchData({
      baseUrl:`${API_BASE_URL}colleges`,
      queryKey:["colls"],
      params:{limit:100}
    })

    
  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const AcceptUser = async (id) => {
    try {
      setLoading(true)
      const res = await axiosInstance.put(`admin/usersManagment/approve/${id}`);
      console.log(res.data);
      toast.success(t("Accept"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setLoading(false)
      setUsers(users+1)
      closeModal();
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  };
  const EditUser=async(Nid,uid) => {
    try {
      setEditLoading(true)
      const res=await axiosInstance.put(`admin/usersManagment/updateNationalId/${uid}`,{
        nationalId:Nid,
      })
      console.log(res.data);
      toast.success(t("userUpdated"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 2000,
      });
      setEditLoading(false)
    } catch (error) {
      console.log(error);
      setEditLoading(false)
    }
  }


  const columns = [
    { key: "fullName", label: t("table.fullName") },
    {
      key: "createdAt",
      label: t("table.createdAt"),
      render: (row) => formatDateOnly(row.createdAt),
    },
    {
      key: "actions",
      label: t("table.actions"),
      render: (row) => (
       <HasPermission permission={"EDIT_USER"}>
         <button onClick={() => openModal(row)} className={styles.btnAction}>
          {t("table.details")}
        </button>
       </HasPermission> ?? '-'
      ),
    },
  ];


  const pageSize = filterValues.limit;

  const filterss = [
    { name: "fullName[contains]", label: t("table.fullName"), type: "text" },
    { name: "nationalId[contains]", label:t("table.nationalId"), type: "text" },
    {
      name:"university[contains]",
      label:t("table.university"),
      type:"select",
      options:uniSearch(universties),
      placeholder:t("select")
    },
    {
      name:"college[contains]",
      label:t("table.college"),
      type:"select",
      options:CollageSearch(colls),
      placeholder:t("select")
    },
    { name: "createdAt[gte]", label: t("startDate"), type: "date" },
    { name: "createdAt[lte]", label: t("endDate"), type: "date" }
  ];
  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };
  

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>
      <div className={styles.tableContainer}>
      <DynamicFilters filters={filterss} values={filterValues} onChange={handleChange} setFilters={setFilterValues} />
        {isLoading ? (
          <SkeletonLoader rows={pageSize} />
        ) : (
          <>
            <Table
              columns={columns}
              data={data?.data?.data}
              currentPage={filterValues.page}
              pageSize={pageSize}
            />

            <StudentDetailsModal
              isOpen={isModalOpen}
              onClose={closeModal}
              student={selectedStudent}
              AcceptUser={AcceptUser}
              t={t}
              loading={loading}
              EditUser={EditUser}
              editLoading={editLoading}
            />

            <Pagination
             total={data?.data?.pagination?.total || 0}
             currentPage={filterValues.page}
             setCurrentPage={(page) => setFilterValues((prev) => ({ ...prev, page }))}
             pageSize={filterValues.limit}
            />
            <Toaster />
          </>
        )}
      </div>
    </div>
  );
}
