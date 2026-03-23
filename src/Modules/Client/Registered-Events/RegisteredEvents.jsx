import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./RegisteredEvents.module.css";
import { API_BASE_URL } from "../../../Constants";
import {
  flattenEvents,
  formatDateOnly,
  getLang,
  splitLang,
} from "../../../Utils";
import { useFetchData } from "../../../Hooks/UseFetchData";

const SKELETON_COUNT = 6;

export default function RegisteredEvents() {
  const { t } = useTranslation("EventsTable");
  const lang = getLang();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: events, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/usersManagment/users/registration`,
    queryKey: ["userRegisteredEvents"],
    options: { keepPreviousData: true },
  });

  const apiData = events?.data || [];
  const flattenedEvents = flattenEvents(apiData);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSelectedEvent(null);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className={styles.content}>
      <h1 className={styles.pageTitle}>{t("events.userRegisteredTitle")}</h1>
      <div className={styles.cardContainer}>
        <div className={styles.cardsWrapper}>
          {isLoading ? (
            <>
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
                    <div className={`${styles.skeleton} ${styles.skeletonStatus}`} />
                  </div>
                  <div className={styles.cardBody}>
                    {[1, 2, 3].map((row) => (
                      <div key={row} className={styles.cardRow}>
                        <div className={`${styles.skeleton} ${styles.skeletonLabel}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonValue}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : flattenedEvents.length === 0 ? (
            <p className={styles.emptyText}>{t("events.noRegisteredEvents")}</p>
          ) : (
            flattenedEvents.map((row) => {
              const localizedTitle =
                lang !== "ar"
                  ? splitLang(row.reservationEvent_eventName).en
                  : splitLang(row.reservationEvent_eventName).ar ||
                    row.reservationEvent_eventName;

              const now = new Date();
              const start = new Date(row.reservationEvent_startDate);
              const end = new Date(row.reservationEvent_endDate);

              let statusKey = "events.statusInProgress";
              if (end < now) {
                statusKey = "events.statusFinished";
              } else if (start > now) {
                statusKey = "events.statusNotStarted";
              }

              const isFinished = end < now;

              return (
                <div
                  key={row.eventId}
                  className={styles.card}
                  onClick={() => setSelectedEvent(row)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedEvent(row)}
                >
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>
                      {localizedTitle || "-"}
                    </h2>
                    <span
                      className={`${styles.statusBadge} ${
                        isFinished ? styles.closed : styles.opend
                      }`}
                    >
                      {t(statusKey)}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <span className={styles.label}>{t("events.type")}:</span>
                      <span className={styles.value}>
                        {row.reservationEvent_type === "training"
                          ? t("events.training")
                          : t("events.exam")}
                      </span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.label}>
                        {t("events.registrationStartDate")}:
                      </span>
                      <span className={styles.value}>
                        {formatDateOnly(row.reservationEvent_startDateRes)}
                      </span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.label}>
                        {t("events.registrationEndDate")}:
                      </span>
                      <span className={styles.value}>
                        {formatDateOnly(row.reservationEvent_endDateRes)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedEvent && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {lang !== "ar"
                  ? splitLang(selectedEvent.reservationEvent_eventName).en
                  : splitLang(selectedEvent.reservationEvent_eventName).ar ||
                    selectedEvent.reservationEvent_eventName}
              </h2>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedEvent(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.modalDates}>
              <div className={styles.dateItem}>
                <span className={styles.dateText}>
                  {lang === "ar"
                    ? "بداية الدورة:"
                    : `${t("events.registrationStartDate")}:`}
                </span>

                <span className={styles.dateNumber}>
                  {formatDateOnly(selectedEvent.reservationEvent_startDate)}
                </span>
              </div>

              <div className={styles.dateItem}>
                <span className={styles.dateText}>
                  {lang === "ar"
                    ? "نهاية الدورة:"
                    : `${t("events.registrationEndDate")}:`}
                </span>

                <span className={styles.dateNumber}>
                  {formatDateOnly(selectedEvent.reservationEvent_endDate)}
                </span>
              </div>
            </div>

            <h3 className={styles.otherCoursesTitle}>
              {t("events.popupOtherCourses")}
            </h3>

            <div className={styles.modalBody}>
              <div className={styles.otherCoursesGrid}>
                {(selectedEvent.reservationEvent_type === "training"
                  ? selectedEvent.reservationEvent_trainings
                  : selectedEvent.reservationEvent_exams ?? []
                ).map((course, idx) => (
                  <div key={idx} className={styles.courseTag}>
                    <span className={styles.courseName}>
                      {lang === "ar"
                        ? splitLang(course.course.name).ar ?? course.course.name
                        : splitLang(course.course.name).en ??
                          course.course.name}
                    </span>

                    <span className={styles.courseDoctor}>
                      {selectedEvent.reservationEvent_type === "training"
                        ? lang === "ar"
                          ? splitLang(course.trainer.Name).ar ??
                            course.trainer.Name
                          : splitLang(course.trainer.Name).en ??
                            course.trainer.Name
                        : lang === "ar"
                        ? splitLang(course.supervisor.Name).ar ??
                          course.supervisor.Name
                        : splitLang(course.supervisor.Name).en ??
                          course.supervisor.Name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
