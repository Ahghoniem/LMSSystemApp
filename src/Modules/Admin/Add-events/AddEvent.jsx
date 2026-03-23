import React, { useState } from "react";
import styles from "./AddEvent.module.css";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../Constants";
import { getLang, getToken, splitLang } from "../../../Utils";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";
import axiosInstance from "../../../Constants/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { FormData } from "./objects";
import { validateField, validateTrainingForm, validateExamForm } from "./validation";
import { prepareTrainingFormData, prepareExamFormData, preparePackageExamData } from "./formDataHelpers";
import {
  LanguageSelector,
  OneSupervisorTrainerCheckbox,
  EventTypeSelector,
  RelatedToSelector,
  ProductSelector,
  EventNameInputs,
  ReservationDateInputs,
  CourseExamDateInputs,
  CapacityInput,
  ExamDateInput,
  SupervisorSelector,
  PlaceInput,
  CourseSelector,
  PackageSelector,
  TrainerSelector,
  PackageExamInputs,
  CourseTrainerInputs,
} from "./formComponents";
export default function AddEvent() {
  const [eventData, setEventData] = useState({
    ...FormData,
    selectedPackage: "",
    exams: [],
    courseTrainers: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [relatedTo, setRelatedTo] = useState("");
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;
  const englishRegex = /^[A-Za-z0-9\s]+$/;


  const { t } = useTranslation("AddEvents");
  const token = getToken();
  const lang = getLang();

  const hasErrors = (errors) => Object.values(errors).some((error) => error);

  const { data: users } = useFetchData({
    baseUrl: `${API_BASE_URL}SuperAdmin/`,
    queryKey: ["users"],
    token,
  });



  const { data:supers } = useFetchData({
      baseUrl: `${API_BASE_URL}SuperAdmin/Supervisor`,
      queryKey: ["ApprovedUsers"],
      token,
      options: { keepPreviousData: true },
    });
    
  

  const { data: courses } = useFetchData({
    baseUrl: `${API_BASE_URL}courses`,
    queryKey: ["courses"],
    token,
  });

  const { data: products } = useFetchData({
    baseUrl: `${API_BASE_URL}products`,
    queryKey: ["products"],
  });

  const { data: packs } = useFetchData({
    baseUrl: `${API_BASE_URL}admin/packagegManagement`,
    queryKey: ["Packs"],
    token,
  });

  const handleFieldValidation = (name, value) => {
    const error = validateField(name, value, t, arabicRegex, englishRegex);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    handleFieldValidation(name, value);
    if (name === "capacity" && value < 0) return;
    setEventData((prev) => {
      const next = { ...prev, [name]: type === "number" && value < 0 ? "" : value };
      if (name === "eventType" || name === "eventLanguage") {
        next.courseTrainers = [];
      }
      if (name === "courseId" && relatedTo === "Package" && prev.eventType === "Training" && value) {
        const pkg = packs?.data?.data?.find((p) => p.packageId === value);
        next.courseTrainers = (pkg?.courses ?? []).map((c) => ({ courseId: c.courseId, trainerId: "" }));
      }
      return next;
    });
  };

  const handleRelatedToChange = (e) => {
    const value = e.target.value;
    setRelatedTo(value);
    setEventData((prev) => ({
      ...prev,
      courseId: "",
      selectedPackage: "",
      exams: [],
      courseTrainers: [],
    }));
  };

  const handlePackageSelect = (e) => {
    const selectedPackage = e.target.value;
    const pkg = packs?.data?.data.find((p) => p.packageId === selectedPackage);
    const size = pkg ? pkg.size : 0;
    const examsArray = Array.from({ length: size }, () => ({
      name: "",
      date: "",
      place: "",
      supervisorId: "",
    }));
    setEventData((prev) => ({
      ...prev,
      selectedPackage,
      courseId: selectedPackage,
      exams: examsArray,
    }));
  };

  const handleExamChange = (index, field, value) => {
    setEventData((prev) => {
      const updatedExams = [...prev.exams];
      updatedExams[index][field] = value;
      return { ...prev, exams: updatedExams };
    });
    handleFieldValidation(`exam_${index}_${field}`, value);
  };

  const handleCourseTrainerChange = (index, field, value) => {
    setEventData((prev) => {
      const updated = [...(prev.courseTrainers || [])];
      if (!updated[index]) updated[index] = { courseId: "", trainerId: "" };
      updated[index][field] = value;
      return { ...prev, courseTrainers: updated };
    });
  };

  const handleOneSupervisorTrainerChange = (checked) => {
    setEventData((prev) => ({ ...prev, oneSupervisorOrTrainerForEvent: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (eventData.eventType === "Training") {
      newErrors = validateTrainingForm(eventData, relatedTo, t);
    } else if (eventData.eventType === "Exam") {
      newErrors = validateExamForm(eventData, relatedTo, t);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (eventData.eventType === "Training") {
      try {
        setLoading(true);
        const formTrainingData = prepareTrainingFormData(eventData, relatedTo);
        console.log(formTrainingData);
        
        await axiosInstance.post(
          "admin/trainingManagement/",
          formTrainingData
        );
        toast.success(t("success.trainingAdded"), {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
          duration: 2000,
        });
        setLoading(false);
        setEventData({ ...FormData, selectedPackage: "", exams: [], courseTrainers: [] });
        setRelatedTo("");
      } catch (error) {
        setLoading(false);
        console.log(error);
        console.log(error.response.data.status);
        toast.error(t(error?.response?.data?.status), {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
          duration: 2000,
        });
      }
    } else if (eventData.eventType === "Exam" && relatedTo !== "Package") {
      try {
        setLoading(true);
        const formExamData = prepareExamFormData(eventData);
        if (!formExamData.startDateRes || !formExamData.endDateRes || !formExamData.date || !formExamData.startDate || !formExamData.endDate) {
          toast.error(t("errors.invalidDates") || "Invalid dates provided", {
            position: "top-center",
            style: { backgroundColor: "red", color: "white" },
            duration: 2000,
          });
          setLoading(false);
          return;
        }
        await axiosInstance.post("admin/examManagment/", formExamData);        
        toast.success(t("success.examAdded"), {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
          duration: 2000,
        });
        setLoading(false);
        setEventData({ ...FormData, selectedPackage: "", exams: [], courseTrainers: [] });
        setRelatedTo("");
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    } else if (eventData.eventType === "Exam" && relatedTo === "Package") {
      try {
        setLoading(true);
        const pkg = packs?.data?.data?.find(
          (p) => p.packageId === eventData.selectedPackage
        )
        
        if (!pkg) {
          toast.error(t("errors.packageNotFound") || "Package not found", {
            position: "top-center",
            style: { backgroundColor: "red", color: "white" },
            duration: 2000,
          });
          setLoading(false);
          return;
        }
        
        const examPackageData = preparePackageExamData(eventData, pkg);
        if (!examPackageData.startDateRes || !examPackageData.endDateRes || examPackageData.courses.length === 0 || examPackageData.courses.some(c => !c.courseId || !c.date || !c.place || !c.supervisorId)) {
          toast.error(t("errors.invalidDates") || "Invalid or missing data for package exams", {
            position: "top-center",
            style: { backgroundColor: "red", color: "white" },
            duration: 2000,
          });
          setLoading(false);
          return;
        }
        await axiosInstance.post("admin/examManagment/", examPackageData);
        
        toast.success(t("success.examAdded"), {
          position: "top-center",
          style: { backgroundColor: "green", color: "white" },
          duration: 2000,
        });
        setLoading(false);
        
        
        setEventData({ ...FormData, selectedPackage: "", exams: [], courseTrainers: [] });
        setRelatedTo("");
      } catch (error) {
        setLoading(false);
        console.error("Error creating exams:", error);
        console.error("Error response:", error?.response?.data);
        console.error("Error status:", error?.response?.status);
        if (error?.response?.data?.errors) {
          console.error("Error details:", error.response.data.errors);
          // Log each error separately for clarity
          error.response.data.errors.forEach((err, idx) => {
            console.error(`Error ${idx + 1}:`, err);
          });
        }
        toast.error(
          error?.response?.data?.message || error?.message || t("errors.submitFailed") || "Failed to create exams",
          {
            position: "top-center",
            style: { backgroundColor: "red", color: "white" },
            duration: 3000,
          }
        );
      }
    }
  };


  const today = new Date().toISOString().split("T")[0];
  return (
    <div className={styles.addEventPage}>
      <div className={styles.eventBox}>
        <div className={styles.eventHeader}>
          <h1>{t("title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <LanguageSelector
            value={eventData.eventLanguage}
            onChange={handleChange}
            t={t}
          />

          <EventTypeSelector
            value={eventData.eventType}
            onChange={handleChange}
            error={errors.eventType}
            t={t}
          />

          <RelatedToSelector value={relatedTo} onChange={handleRelatedToChange} t={t} />

          <ProductSelector
            value={eventData.productId}
            onChange={handleChange}
            error={errors.productId}
            products={products}
            eventType={eventData.eventType}
            t={t}
          />

          <EventNameInputs
            eventData={eventData}
            onChange={handleChange}
            errors={errors}
            t={t}
          />

          <ReservationDateInputs
            eventData={eventData}
            onChange={handleChange}
            errors={errors}
            today={today}
            relatedTo={relatedTo}
            eventType={eventData.eventType}
            t={t}
          />

          <CourseExamDateInputs
            eventData={eventData}
            onChange={handleChange}
            errors={errors}
            today={today}
            eventType={eventData.eventType}
            relatedTo={relatedTo}
            t={t}
          />

          <CapacityInput
            value={eventData.capacity}
            onChange={handleChange}
            error={errors.capacity}
            t={t}
          />

          {eventData.eventType === "Exam" && relatedTo === "Module" && (
            <ExamDateInput
              value={eventData.date}
              onChange={handleChange}
              error={errors.date}
              minDate={eventData.endDateRes}
              today={today}
              t={t}
            />
          )}

          {eventData.eventType === "Exam" && relatedTo === "Module" && (
            <>
              <SupervisorSelector
                value={eventData.supervisorId}
                onChange={handleChange}
                error={errors.supervisorId}
                users={supers?.data?.data}
                t={t}
              />

              <PlaceInput
                value={eventData.place}
                onChange={handleChange}
                error={errors.place}
                t={t}
              />

              <CourseSelector
                value={eventData.courseId}
                onChange={handleChange}
                error={errors.courseId}
                courses={courses}
                t={t}
              />
            </>
          )}

          {eventData.eventType === "Exam" && relatedTo === "Package" && (
            <>
              <PackageSelector
                value={eventData.selectedPackage}
                onChange={handlePackageSelect}
                error={errors.selectedPackage}
                packs={packs}
                lang={lang}
                t={t}
              />

              {eventData.oneSupervisorOrTrainerForEvent && (
                <SupervisorSelector
                  value={eventData.supervisorId}
                  onChange={handleChange}
                  error={errors.supervisorId}
                  users={supers?.data?.data}
                  t={t}
                />
              )}

              <OneSupervisorTrainerCheckbox
                checked={eventData.oneSupervisorOrTrainerForEvent}
                onChange={handleOneSupervisorTrainerChange}
                t={t}
              />

              {eventData.exams.length > 0 && (
                <div className={styles.fullWidthRow}>
                  <PackageExamInputs
                    exams={eventData.exams}
                    onChange={handleExamChange}
                    errors={errors}
                    packs={packs}
                    selectedPackage={eventData.selectedPackage}
                    lang={lang}
                    startDate={eventData.startDate}
                    endDate={eventData.endDate}
                    startDateRes={eventData.startDateRes}
                    endDateRes={eventData.endDateRes}
                    today={today}
                    startExamDate={eventData.startExamDate}
                    endExamDate={eventData.endExamDate}
                    oneSupervisorForEvent={eventData.oneSupervisorOrTrainerForEvent}
                    supervisors={supers?.data?.data}
                    t={t}
                  />
                </div>
              )}
            </>
          )}

          {eventData.eventType === "Training" && (
            <>
              {(eventData.oneSupervisorOrTrainerForEvent || relatedTo === "Module") && (
                <TrainerSelector
                  value={eventData.trainerId}
                  onChange={handleChange}
                  error={errors.trainerId}
                  users={users?.data?.data}
                  t={t}
                />
              )}

              <div className={styles.formGroup}>
                <label>{t("fields.field")}</label>
                <select
                  name="courseId"
                  value={eventData.courseId}
                  onChange={handleChange}
                >
                  <option value="">{t("options.select")}</option>
                  {courses && relatedTo === "Module"
                    ? courses?.data?.data.map((course) => (
                        <option key={course.courseId} value={course.courseId}>
                          {splitLang(course.name).ar || course.name}
                        </option>
                      ))
                    : relatedTo === "Package" &&
                      packs?.data?.data.map((pkg) => (
                        <option key={pkg.packageId} value={pkg.packageId}>
                          {lang === "ar" ? splitLang(pkg.packageName).ar : splitLang(pkg.packageName).en}
                        </option>
                      ))}
                </select>
                {errors.courseId && (
                  <span className={styles.error}>{errors.courseId}</span>
                )}
              </div>

              {relatedTo === "Package" && (
                <OneSupervisorTrainerCheckbox
                  checked={eventData.oneSupervisorOrTrainerForEvent}
                  onChange={handleOneSupervisorTrainerChange}
                  t={t}
                />
              )}

              {eventData.eventType === "Training" &&
                relatedTo === "Package" &&
                !eventData.oneSupervisorOrTrainerForEvent &&
                eventData.courseTrainers?.length > 0 && (
                  <CourseTrainerInputs
                    courseTrainers={eventData.courseTrainers}
                    onChange={handleCourseTrainerChange}
                    errors={errors}
                    packageCourses={
                      packs?.data?.data?.find((p) => p.packageId === eventData.selectedPackage || eventData.courseId)
                        ?.courses ?? []
                    }
                    trainers={users?.data?.data}
                    lang={lang}
                    t={t}
                  />
                )}
            </>
          )}

          <button
            type="submit"
            disabled={ loading || hasErrors(errors)}
            className={styles.btn}
          >
            {!loading ? (
              <>
                <i className="fa-solid fa-check"></i> {t("buttons.accept")}
              </>
            ) : (
              <div className={styles.load}>
                <span>{t("buttons.loading")}</span>
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
              </div>
            )}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
}