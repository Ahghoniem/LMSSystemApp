import React from "react";
import styles from "./AddEvent.module.css";
import { getLang, splitLang } from "../../../Utils";
const lang =getLang()

// Reusable form input component
export const FormInput = ({ label, name, type = "text", value, onChange, placeholder, error, min, ...props }) => (
  <div className={styles.formGroup}>
    <label>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      {...props}
    />
    {error && <span className={styles.error}>{error}</span>}
  </div>
);

// Reusable form select component
export const FormSelect = ({ label, name, value, onChange, options, error, children, ...props }) => (
  <div className={styles.formGroup}>
    <label>{label}</label>
    <select name={name} value={value} onChange={onChange} {...props}>
      {children || options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
         {opt.label}
        </option>
      ))}
    </select>
    {error && <span className={styles.error}>{error}</span>}
  </div>
);


export const LanguageSelector = ({ value, onChange, t }) => (
  <div className={styles.formGroup}>
    <label>{t("fields.eventLanguage")}</label>
    <select name="eventLanguage" value={value} onChange={onChange}>
      <option value="">{t("options.selectLanguage")}</option>
      <option value="AR">{t("options.languageAr")}</option>
      <option value="EN">{t("options.languageEn")}</option>
    </select>
  </div>
);


export const OneSupervisorTrainerCheckbox = ({ checked, onChange, t }) => (
  <div className={styles.formGroup}>
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{t("fields.oneSupervisorTrainer")}</span>
    </label>
  </div>
);

// Event type selector
export const EventTypeSelector = ({ value, onChange, error, t }) => (
  <FormSelect
    label={t("fields.eventType")}
    name="eventType"
    value={value}
    onChange={onChange}
    error={error}
    required
  >
    <option value="">{t("options.selectEventType")}</option>
    <option value="Training">{t("options.training")}</option>
    <option value="Exam">{t("options.exam")}</option>
  </FormSelect>
);

// Related to selector
export const RelatedToSelector = ({ value, onChange, t }) => (
  <div className={styles.formGroup}>
    <label>{t("fields.relatedTo")}</label>
    <select value={value} onChange={onChange}>
      <option value="">{t("options.select")}</option>
      <option value="Module">{t("options.module")}</option>
      <option value="Package">{t("options.package")}</option>
    </select>
  </div>
);


export const ProductSelector = ({ value, onChange, error, products, eventType, t }) => {
  const list = products?.data?.data ?? [];
  const filtered =
    eventType === "Training"
      ? list.filter((pro) => {
          const type = (pro.type ?? pro.productType ?? "").toString().toLowerCase();
          const nameAr = (pro.courseNameAr ?? "").toString();
          const nameEn = (pro.courseNameEn ?? pro.courseName ?? "").toString().toLowerCase();

          const forbiddenArabicCombo =
            nameAr.includes("امتحان + ماده علميه") ||
            nameAr.includes("امتحان + مادة علمية");

          const forbiddenEnglishCombo =
            nameEn.includes("exam + study material");

          if (forbiddenArabicCombo || forbiddenEnglishCombo) return false;

          return !type.includes("exam") && !type.includes("study");
        })
      : list;
  return (
    <FormSelect
      label={t("type")}
      name="productId"
      value={value}
      onChange={onChange}
      error={error}
    >
      <option value="">{t("options.select")}</option>
      {filtered.map((pro) => (
        <option key={pro.productId} value={pro.productId}>
          {pro.courseNameAr}
        </option>
      ))}
    </FormSelect>
  );
};

// Event name inputs
export const EventNameInputs = ({ eventData, onChange, errors, t }) => (
  <>
    <FormInput
      label={t("eventName")}
      name="eventName"
      value={eventData.eventName}
      onChange={onChange}
      placeholder={t("eventName")}
      error={errors.eventName}
    />
    <FormInput
      label={t("eventNameEn")}
      name="eventNameEn"
      value={eventData.eventNameEn}
      onChange={onChange}
      placeholder={t("eventNameEn")}
      error={errors.eventNameEn}
    />
  </>
);

// Reservation date inputs
export const ReservationDateInputs = ({ eventData, onChange, errors, today, eventType,relatedTo, t }) => (
  <>
    <FormInput
      label={t("fields.startDate")}
      name="startDateRes"
      type="date"
      min={today}
      value={eventData.startDateRes}
      onChange={onChange}
      error={errors.startDateRes}
    />
    <FormInput
      label={t("fields.endDate")}
      name="endDateRes"
      type="date"
      min={eventData.startDateRes || today}
      value={eventData.endDateRes}
      onChange={onChange}
      error={errors.endDateRes}
    />
    {eventType === "Exam" && relatedTo === "Package" && (
      <>
        <FormInput
          label={t("fields.startExamDate")}
          name="startExamDate"
          type="date"
          min={eventData.endDateRes || today}
          value={eventData.startExamDate}
          onChange={onChange}
          error={errors.startExamDate}
        />
        <FormInput
          label={t("fields.endExamDate")}
          name="endExamDate"
          type="date"
          min={eventData.startExamDate || eventData.endDateRes || today}
          value={eventData.endExamDate}
          onChange={onChange}
          error={errors.endExamDate}
        />
      </>
    )}
  </>
);


export const CourseExamDateInputs = ({ eventData, onChange, errors, today, eventType, t }) => {
  if (eventType === "Training") {
    return (
      <>
        <FormInput
          label={t("fields.courseStartDate")}
          name="startDate"
          type="date"
          min={eventData.endDateRes || today}
          value={eventData.startDate}
          onChange={onChange}
          error={errors.startDate}
        />
        <FormInput
          label={t("fields.courseEndDate")}
          name="endDate"
          type="date"
          min={eventData.startDate || today}
          value={eventData.endDate}
          onChange={onChange}
          error={errors.endDate}
        />
      </>
    );
  }
  return null;
};

// Capacity input
export const CapacityInput = ({ value, onChange, error, t }) => (
  <FormInput
    label={t("fields.capacity")}
    name="capacity"
    type="number"
    placeholder={t("fields.capacity")}
    value={value}
    min="1"
    onChange={onChange}
    error={error}
  />
);

// Exam date input (for Module exams)
export const ExamDateInput = ({ value, onChange, error, minDate, today, t }) => (
  <FormInput
    label={t("examDate")}
    name="date"
    type="date"
    min={minDate || today}
    value={value}
    onChange={onChange}
    error={error}
  />
);

// Supervisor selector
export const SupervisorSelector = ({ value, onChange, error, users, t }) => (
  <FormSelect
    label={t("fields.supervisorName")}
    name="supervisorId"
    value={value}
    onChange={onChange}
    error={error}
  >
    <option value="">{t("options.select")}</option>
    {users?.map((user) => (
      <option key={user.userId} value={user.userId}>
         {lang === 'ar' && splitLang(user.Name).ar? splitLang(user.Name).ar:splitLang(user.Name).en }
      </option>
    ))}
  </FormSelect>
);

// Place input
export const PlaceInput = ({ value, onChange, error, t }) => (
  <FormInput
    label={t("fields.examPlace")}
    name="place"
    placeholder={t("fields.examPlace")}
    value={value}
    onChange={onChange}
    error={error}
  />
);

// Course selector
export const CourseSelector = ({ value, onChange, error, courses, t }) => (
  <FormSelect
    label={t("fields.field")}
    name="courseId"
    value={value}
    onChange={onChange}
    error={error}
  >
    <option value="">{t("options.select")}</option>
    {courses?.data?.data.map((course) => (
      <option key={course.courseId} value={course.courseId}>
        {splitLang(course.name).ar || course.name}
      </option>
    ))}
  </FormSelect>
);

// Package selector
export const PackageSelector = ({ value, onChange, error, packs, lang, t }) => (
  <FormSelect
    label={t("selectedPackage")}
    name="selectedPackage"
    value={value || ""}
    onChange={onChange}
    error={error}
  >
    <option value="">{t("options.select")}</option>
    {packs?.data?.data?.map((pkg) => (
      <option key={pkg.packageId} value={pkg.packageId}>
        {lang === 'ar' ? splitLang(pkg.packageName).ar : splitLang(pkg.packageName).en}
      </option>
    ))}
  </FormSelect>
);

// Trainer selector
export const TrainerSelector = ({ value, onChange, error, users, t }) => (
  <FormSelect
    label={t("fields.trainerName")}
    name="trainerId"
    value={value}
    onChange={onChange}
    error={error}
  >
    <option value="">{t("options.select")}</option>
    {users?.map((user) => (
      <option key={user.userId} value={user.userId}>
        {user.Name}
      </option>
    ))}
  </FormSelect>
);


export const CourseTrainerInputs = ({
  courseTrainers,
  onChange,
  errors,
  packageCourses,
  trainers,
  lang,
  t,
}) => {
  if (!courseTrainers?.length) return null;
  return (
    <div className={styles.fullWidthRow}>
      <div className={styles.courseTrainerGrid}>
        {courseTrainers.map((item, index) => {
          const courseName =
            lang === "ar"
              ? (splitLang(packageCourses[index]?.courseName || packageCourses[index]?.name).ar ||
                  packageCourses[index]?.courseName ||
                  packageCourses[index]?.name)
              : (splitLang(packageCourses[index]?.courseName || packageCourses[index]?.name).en ||
                  packageCourses[index]?.courseName ||
                  packageCourses[index]?.name);
          return (
            <div className={styles.formGroup} key={index}>
              <label>{t("courseTrainer")} - {courseName}</label>
              <select
                value={item.trainerId ?? ""}
                onChange={(e) => onChange(index, "trainerId", e.target.value)}
              >
                <option value="">{t("options.select")}</option>
                {trainers?.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {lang === "ar" && splitLang(user.Name).ar
                      ? splitLang(user.Name).ar
                      : splitLang(user.Name).en}
                  </option>
                ))}
              </select>
              {errors[`courseTrainer_${index}_trainerId`] && (
                <span className={styles.error}>{errors[`courseTrainer_${index}_trainerId`]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


export const PackageExamInputs = ({
  exams,
  onChange,
  errors,
  packs,
  selectedPackage,
  lang,
  startDate,
  endDate,
  startDateRes,
  endDateRes,
  today,
  oneSupervisorForEvent,
  supervisors,
  t,
  startExamDate,
  endExamDate,
}) => {
  const selectedPkg = packs?.data?.data?.find((p) => p.packageId === selectedPackage);
  const packageCourses = selectedPkg?.courses || [];

  const getSelectedExamNames = (currentIndex) => {
    return exams
      .map((exam, idx) => (idx !== currentIndex ? exam.name : null))
      .filter(Boolean);
  };

  return (
    <>
      {exams.map((exam, index) => {
        const allowedExamDates = (() => {
          const dates = [];
          if (startDate) dates.push(startDate);
          if (endDate && endDate !== startDate) dates.push(endDate);
          if (startExamDate) dates.push(startExamDate);
          if (endExamDate && endExamDate !== startExamDate) dates.push(endExamDate);
          if (!dates.length) {
            if (startDateRes) dates.push(startDateRes);
            if (endDateRes && endDateRes !== startDateRes) dates.push(endDateRes);
          }
          return [...new Set(dates.filter(Boolean))];
        })();

        const selectedNames = getSelectedExamNames(index);
        const availableCourses = packageCourses.filter(
          (course) => !selectedNames.includes(course.courseId)
        );

        return (
          <div
            className={
              oneSupervisorForEvent ? styles.packageExamRowThreeCols : styles.packageExamRow
            }
            key={index}
          >
            <div className={styles.formGroup}>
              <label>{t("fields.examName")} {index + 1}</label>
              <select
                value={exam.name}
                onChange={(e) => onChange(index, "name", e.target.value)}
              >
                <option value="">{t("options.select")}</option>
                {availableCourses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {lang === "ar"
                      ? (splitLang(course.courseName || course.name).ar ||
                          course.courseName ||
                          course.name)
                      : (splitLang(course.courseName || course.name).en ||
                          course.courseName ||
                          course.name)}
                  </option>
                ))}
              </select>
              {errors[`exam_${index}_name`] && (
                <span className={styles.error}>{errors[`exam_${index}_name`]}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>{t("examDate")} {index + 1}</label>
              {allowedExamDates.length > 0 ? (
                <select
                  value={allowedExamDates.includes(exam.date) ? exam.date : ""}
                  onChange={(e) => onChange(index, "date", e.target.value)}
                >
                  <option value="">{t("options.select")}</option>
                  {allowedExamDates.map((dateOption) => (
                    <option key={dateOption} value={dateOption}>
                      {dateOption}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="date"
                  min={startDate || startDateRes || today}
                  max={endDate || endDateRes || undefined}
                  value={exam.date}
                  onChange={(e) => onChange(index, "date", e.target.value)}
                />
              )}
              {errors[`exam_${index}_date`] && (
                <span className={styles.error}>{errors[`exam_${index}_date`]}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>{t("fields.examPlace")} {index + 1}</label>
              <input
                type="text"
                placeholder={t("fields.examPlace")}
                value={exam.place ?? ""}
                onChange={(e) => onChange(index, "place", e.target.value)}
              />
              {errors[`exam_${index}_place`] && (
                <span className={styles.error}>{errors[`exam_${index}_place`]}</span>
              )}
            </div>
            {!oneSupervisorForEvent && supervisors && (
              <div className={styles.formGroup}>
                <label>{t("courseSupervisor")} {index + 1}</label>
                <select
                  value={exam.supervisorId ?? ""}
                  onChange={(e) => onChange(index, "supervisorId", e.target.value)}
                >
                  <option value="">{t("options.select")}</option>
                  {supervisors.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {lang === "ar" && splitLang(user.Name).ar
                        ? splitLang(user.Name).ar
                        : splitLang(user.Name).en}
                    </option>
                  ))}
                </select>
                {errors[`exam_${index}_supervisorId`] && (
                  <span className={styles.error}>{errors[`exam_${index}_supervisorId`]}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};