import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Filters.module.css";
import { getLang } from "../../Utils";
import Select from "react-select";
import { reactSelectGlobalStyles } from "../../Constants/SelectGlobalStyles";
import axiosInstance from "../../Constants/axiosInstance";

export default function Filters({
  filters,
  setFilters,
  hasDate,
  searchOptions,
  defaultValue,
  universties = [],
}) {
  const { t } = useTranslation("filters");
  const lang = getLang();
  const [disabled,setDisbaled]=useState(true)
  const [Students,setStudents]=useState([])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "searchFields" ? { search: "" } : {}),
      page: 1,
    }));
  };


  const handleSelectChange = async (name, option) => {
    // Base case: update the field
    setFilters((prev) => ({
      ...prev,
      [name]: option ? option.value : "",
      page: 1,
    }));
    if (name === "university" && option) {
      const res = await axiosInstance(
        `/admin/usersManagment/byStatus/APPROVED?searchFields=university&search=${option.value}`
      );
      setStudents(res?.data?.data?.data || []);
      setDisbaled(false);
    }
    if (name === "search" && !disabled) {
      setFilters((prev) => ({
        ...prev,
        search: option.value,
        searchFields: "fullName",
        page: 1,
      }));
    }
  };

  const Refresh = () => {
    setFilters(defaultValue);
  };

  const clearSearch = () => {
    setFilters({ ...filters, search: "" });
  };

  return (
    <>
      <div className={styles.filtersGrid}>
        {/* Refresh Button */}
        <div className={`${styles.filterCol} ${styles.search}`}>
          <button
            id="refreshBtn"
            className={styles.btnRefresh}
            title={t("refresh")}
            onClick={Refresh}
          >
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>

        {/* Page Size */}
        <div className={styles.filterCol}>
          <label htmlFor="pageSize" className={styles.filterLabel}>
            {t("itemsCount")}
          </label>
          <Select
            id="pageSize"
            styles={reactSelectGlobalStyles}
            placeholder=""
            value={
              filters.limit
                ? { value: filters.limit, label: filters.limit }
                : null
            }
            onChange={(option) => handleSelectChange("limit", option)}
            options={[
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "30", label: "30" },
              { value: "40", label: "40" },
            ]}
          />
        </div>

        {/* Search Type */}
        <div className={styles.filterCol}>
          <label htmlFor="searchType" className={styles.filterLabel}>
            {t("searchType")}
          </label>
          <Select
            id="searchType"
            styles={reactSelectGlobalStyles}
            placeholder={t("select")}
            value={
              filters.searchFields
                ? {
                    value: filters.searchFields,
                    label:
                      t(
                        searchOptions.find(
                          (item) => item.key === filters.searchFields
                        )?.label
                      ) || "",
                  }
                : null
            }
            onChange={(option) => handleSelectChange("searchFields", option)}
            options={searchOptions.map((item) => ({
              value: item.key,
              label: t(item.label),
            }))}
          />
        </div>

        {/* Search Input / Status */}
        <div className={`${styles.filterCol} ${styles.filterColGrow}`}>
          <label htmlFor="searchInput" className={styles.filterLabel}>
            {t("search")}
          </label>
          {filters.searchFields !== "status" ? (
            <div className={styles.searchWrap}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                style={{ border: "none", outline: "none" }}
                type="text"
                id="searchInput"
                onChange={handleInputChange}
                name="search"
                value={filters.search}
                placeholder={t("searchPlaceholder")}
                autoComplete="off"
              />
              <button
                id="clearSearch"
                className={styles.clearSearch}
                title={t("clearSearch")}
                onClick={clearSearch}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          ) : (
            <Select
              styles={reactSelectGlobalStyles}
              placeholder={t("select")}
              value={
                filters.search
                  ? {
                      value: filters.search,
                      label:
                        filters.search === "approved"
                          ? t("approved")
                          : t("pending"),
                    }
                  : null
              }
              onChange={(option) => handleSelectChange("search", option)}
              options={[
                { value: "approved", label: t("approved") },
                { value: "pending", label: t("pending") },
              ]}
            />
          )}
        </div>

        {/* University */}
        <div className={styles.filterCol}>
          <label htmlFor="deptSelect" className={styles.filterLabel}>
            {t("university")}
          </label>
          <Select
            id="deptSelect"
            styles={reactSelectGlobalStyles}
            placeholder={t("select")}
            value={
              filters.university
                ? {
                    value: filters.university,
                    label: filters.university,
                  }
                : null
            }
            onChange={(option) => handleSelectChange("university", option)}
            options={universties.map((uni) => ({
              value: lang === "ar" ? uni.NameAr : uni.NameEn,
              label: lang === "ar" ? uni.NameAr : uni.NameEn,
            }))}
          />
        </div>

        {/* Employee Name */}
        <div className={styles.filterCol}>
          <label htmlFor="empSelect" className={styles.filterLabel}>
            {t("employeeName")}
          </label>
          <Select
            id="empSelect"
            name="search"
            onChange={(option) => handleSelectChange("search", option)} // ✅ explicit handler
            value={
              filters.search
                ? { value: filters.search, label: filters.search } // ✅ object form
                : null
            }
            styles={reactSelectGlobalStyles}
            placeholder={t("select")}
            isDisabled={disabled}
            options={
              Students.map((std) => ({
                value: lang === "ar" ? std.fullName : std.NameEn,
                label: lang === "ar" ? std.fullName : std.NameEn,
              }))
            }
          />
        </div>

        {/* Dates */}
        {hasDate && (
          <>
            <div className={styles.filterCol}>
              <label htmlFor="startDate" className={styles.filterLabel}>
                {t("StartDate")}
              </label>
              <div className={styles.searchWrap}>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  onChange={handleInputChange}
                  value={filters.startDate || ""}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className={styles.filterCol}>
              <label htmlFor="endDate" className={styles.filterLabel}>
                {t("EndDate")}
              </label>
              <div className={styles.searchWrap}>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  onChange={handleInputChange}
                  value={filters.endDate || ""}
                  autoComplete="off"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.filtersSpacer}></div>
    </>
  );
}
