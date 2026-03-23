import React from "react";
import styles from "./index.module.css"; // ✅ Reuse your same CSS
import Select from "react-select";
import { reactSelectGlobalStyles } from "../../Constants/SelectGlobalStyles";
import { DEFUALT_FILTERS } from "../../Constants";

export default function DynamicFilters({
  filters,
  values,
  onChange,
  setFilters,
}) {
  const Refresh = () => {
    setFilters(DEFUALT_FILTERS);
  };

  const clearSearch = (name) => {
    setFilters((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <>
      <div className={styles.filtersGrid}>
        {filters.map((filter) => (
          <div
            key={filter.name}
            className={`${styles.filterCol} ${
              filter.grow ? styles.filterColGrow : ""
            }`}
          >
            <label htmlFor={filter.name} className={styles.filterLabel}>
              {filter.label}
            </label>

            {/* 🧩 Text Input */}
            {filter.type === "text" && (
              <div className={styles.searchWrap}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  id={filter.name}
                  name={filter.name}
                  value={values[filter.name] || ""}
                  onChange={(e) => onChange(filter.name, e.target.value)}
                  placeholder={filter.placeholder || ""}
                  autoComplete="off"
                  style={{ border: "none", outline: "none" }}
                />
                <button
                  id="clearSearch"
                  className={styles.clearSearch}
                  onClick={() => clearSearch(filter.name)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}

            {/* 📅 Date Input */}
            {filter.type === "date" && (
              <div className={styles.searchWrap}>
                <input
                  type="date"
                  id={filter.name}
                  name={filter.name}
                  value={values[filter.name] || ""}
                  onChange={(e) => onChange(filter.name, e.target.value)}
                  autoComplete="off"
                />
              </div>
            )}

            {/* 🔽 Select Input */}
            {filter.type === "select" && (
              <Select
                id={filter.name}
                styles={reactSelectGlobalStyles}
                placeholder={filter.placeholder || "Select"}
                value={
                  filter.options?.find(
                    (opt) =>
                      (typeof opt === "string" ? opt : opt.value) ===
                      values[filter.name]
                  ) || null
                }
                onChange={(option) =>
                  onChange(filter.name, option ? option.value : "")
                }
                options={filter.options?.map((opt) =>
                  typeof opt === "string"
                    ? { value: opt, label: opt }
                    : { value: opt.value, label: opt.label }
                )}
              />
            )}
          </div>
        ))}

        {/* 🔄 Refresh Button */}
        <div className={`${styles.filterCol} ${styles.search}`}>
          <button
            id="refreshBtn"
            className={styles.btnRefresh}
            onClick={Refresh}
          >
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>
      </div>

      <div className={styles.filtersSpacer}></div>
    </>
  );
}
