/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Notifications from "../../../Components/Notifications/Notifications";
import styles from "./AllNotifies.module.css";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL, DEFUALT_FILTERS } from "../../../Constants";
import { Decode_Token, getLang, getToken } from "../../../Utils";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./../../../Constants/axiosInstance";
import Pagination from "../../../Components/Paginator/Pagination";
const AllNotifies = () => {
  const lang = getLang();
  const { t } = useTranslation("notifications");
  const token = getToken();
  const data = Decode_Token(token);
  const [filterValues, setFilterValues] = useState(DEFUALT_FILTERS);
  const queryClient = useQueryClient();
  const { data: notifies } = useFetchData({
    baseUrl: `${API_BASE_URL}notifications/${data.id}`,
    queryKey: ["notifications", filterValues],
    params: filterValues,
  });

  useEffect(() => {
    const markAllRead = async () => {
      try {
        await axiosInstance.put(`notifications/${data.id}`);
        queryClient.invalidateQueries(["NotifiCount"]);
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    };
    markAllRead();
  }, [data.id, token]);

  const iconMapping = {
    Edit: "fa-solid fa-pencil",
    Accept: "fa-solid fa-check-circle",
    Add_training: "fa-solid fa-laptop-code",
    Add_exam: "fa-solid fa-graduation-cap",
  };
  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <section className={styles.section}>
          <Notifications
            notifications={notifies?.data?.data || []}
            iconMapping={iconMapping}
            lang={lang}
            t={t}
          />
          <Pagination
            total={notifies?.data?.pagination?.total || 0}
            currentPage={filterValues.page}
            pageSize={filterValues.limit}
            showPageSize={true}
            setCurrentPage={(page) =>
              setFilterValues((prev) => ({ ...prev, page }))
            }
            setPageSize={(limit) =>
              setFilterValues((prev) => ({
                ...prev,
                limit,
                page: 1,
              }))
            }
          />
        </section>
      </main>
    </div>
  );
};

export default AllNotifies;
