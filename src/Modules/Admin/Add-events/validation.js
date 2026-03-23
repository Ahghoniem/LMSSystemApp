import { concatLang } from "../../../Utils";

// Validation utility functions
export const validateField = (name, value, t, arabicRegex, englishRegex) => {
  let error = "";
  const isEmpty = !value || /^\s+$/.test(value);
  if (isEmpty) error = t("errors.required");
  if (name === "eventName" && !arabicRegex.test(value))
    error = t("arabic_only");
  if (name === "eventNameEn" && !englishRegex.test(value))
    error = t("english_only");
  return error;
};

export const validateTrainingForm = (eventData, relatedTo, t) => {
  const today = new Date();
  const newErrors = {};
  
  const formTrainingData = {
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    capacity: parseInt(eventData.capacity),
    trainerId: eventData.trainerId,
    [relatedTo === "Package" ? "packageId" : "courseId"]: eventData.courseId,
    startDateRes: eventData.startDateRes,
    endDateRes: eventData.endDateRes,
    eventName: concatLang(eventData.eventNameEn, eventData.eventName),
    productId: eventData.productId,
    eventNameEn: eventData.eventNameEn,
  };

  // Validate required fields
  for (const [key, value] of Object.entries(formTrainingData)) {
    if (!value || /^\s+$/.test(value)) {
      newErrors[key] = t("errors.required");
    }
  }

  // Date validations
  const startDate = new Date(eventData.startDate);
  const endDate = new Date(eventData.endDate);
  const startDateRes = new Date(eventData.startDateRes);
  const endDateRes = new Date(eventData.endDateRes);

  if (
    eventData.startDate &&
    startDate < new Date(today.setHours(0, 0, 0, 0))
  ) {
    newErrors.startDate = t("errors.startDateBeforeToday");
  }
  if (eventData.startDate && eventData.endDate && endDate <= startDate) {
    newErrors.endDate = t("errors.endBeforeStart");
  }
  if (
    eventData.startDateRes &&
    startDateRes < new Date(today.setHours(0, 0, 0, 0))
  ) {
    newErrors.startDateRes = t("errors.startDateBeforeToday");
  }
  if (
    eventData.startDateRes &&
    eventData.endDateRes &&
    endDateRes <= startDateRes
  ) {
    newErrors.endDateRes = t("errors.endBeforeStart");
  }
  if (
    eventData.endDateRes &&
    eventData.startDate &&
    new Date(eventData.startDate) < new Date(eventData.endDateRes)
  ) {
    newErrors.startDate = t("errors.startBeforeEnd");
  }

  if (relatedTo === "Package" && !eventData.oneSupervisorOrTrainerForEvent && eventData.courseTrainers?.length) {
    delete newErrors.trainerId;
    eventData.courseTrainers.forEach((item, index) => {
      if (!item.trainerId || /^\s+$/.test(item.trainerId))
        newErrors[`courseTrainer_${index}_trainerId`] = t("errors.required");
    });
  }

  return newErrors;
};

export const validateExamForm = (eventData, relatedTo, t) => {
  const today = new Date();
  const newErrors = {};

  if (relatedTo !== "Package") {
    const formExamData = {
      startDateRes: eventData.startDateRes,
      endDateRes: eventData.endDateRes,
      startDate: eventData.startDateRes,
      endDate: eventData.endDateRes,
      courseId: eventData.courseId,
      capacity: parseInt(eventData.capacity),
      supervisorId: eventData.supervisorId,
      place: eventData.place,
      date: eventData.date,
      eventName: concatLang(eventData.eventNameEn, eventData.eventName),
      productId: eventData.productId,
      eventNameEn: eventData.eventNameEn,
    };

    // Validate required fields
    for (const [key, value] of Object.entries(formExamData)) {
      if (!value || /^\s+$/.test(value)) {
        newErrors[key] = t("errors.required");
      }
    }

    // Date validations
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    const startDateRes = new Date(eventData.startDateRes);
    const endDateRes = new Date(eventData.endDateRes);

    if (
      eventData.startDate &&
      startDate < new Date(today.setHours(0, 0, 0, 0))
    ) {
      newErrors.startDate = t("errors.startDateBeforeToday");
    }
    if (eventData.startDate && eventData.endDate && endDate <= startDate) {
      newErrors.endDate = t("errors.endBeforeStart");
    }
    if (
      eventData.startDateRes &&
      startDateRes < new Date(today.setHours(0, 0, 0, 0))
    ) {
      newErrors.startDateRes = t("errors.startDateBeforeToday");
    }
    if (
      eventData.startDateRes &&
      eventData.endDateRes &&
      endDateRes <= startDateRes
    ) {
      newErrors.endDateRes = t("errors.endBeforeStart");
    }
    if (
      eventData.endDateRes &&
      eventData.startDate &&
      new Date(eventData.startDate) < new Date(eventData.endDateRes)
    ) {
      newErrors.startDate = t("errors.startBeforeEnd");
    }
  } else {
    // Package exam validation
    if (!eventData.capacity || /^\s+$/.test(eventData.capacity))
      newErrors.capacity = t("errors.required");
    if (eventData.oneSupervisorOrTrainerForEvent && (!eventData.supervisorId || /^\s+$/.test(eventData.supervisorId)))
      newErrors.supervisorId = t("errors.required");
    if (!eventData.selectedPackage || /^\s+$/.test(eventData.selectedPackage))
      newErrors.selectedPackage = t("errors.required");

    const startDateRes = new Date(eventData.startDateRes);
    const endDateRes = new Date(eventData.endDateRes);
    if (
      eventData.startDateRes &&
      startDateRes < new Date(today.setHours(0, 0, 0, 0))
    ) {
      newErrors.startDateRes = t("errors.startDateBeforeToday");
    }
    if (
      eventData.startDateRes &&
      eventData.endDateRes &&
      endDateRes <= startDateRes
    ) {
      newErrors.endDateRes = t("errors.endBeforeStart");
    }

    // Validate exam array
    const selectedExamNames = [];
    eventData.exams.forEach((exam, index) => {
      if (!exam.name || /^\s+$/.test(exam.name)) {
        newErrors[`exam_${index}_name`] = t("errors.required");
      } else {
        if (selectedExamNames.includes(exam.name)) {
          newErrors[`exam_${index}_name`] = t("errors.duplicateExam") || "This exam is already selected";
        } else {
          selectedExamNames.push(exam.name);
        }
      }
      if (!exam.date || /^\s+$/.test(exam.date))
        newErrors[`exam_${index}_date`] = t("errors.required");
      const examDate = new Date(exam.date);
      if (exam.date && examDate < new Date(today.setHours(0, 0, 0, 0))) {
        newErrors[`exam_${index}_date`] = t("errors.startDateBeforeToday");
      }
      const examStartWindow = eventData.startDate ? new Date(eventData.startDate) : (eventData.startDateRes ? new Date(eventData.startDateRes) : null);
      // const examEndWindow = eventData.endDate ? new Date(eventData.endDate) : (eventData.endDateRes ? new Date(eventData.endDateRes) : null);
      if (
        exam.date &&
        examStartWindow &&
        examDate < examStartWindow
      ) {
        newErrors[`exam_${index}_date`] = t("errors.examDateBeforeExamStart") || "Exam date must be on or after the selected start date";
      }
      // if (
      //   exam.date &&
      //   examEndWindow &&
      //   examDate > examEndWindow
      // ) {
      //   newErrors[`exam_${index}_date`] = t("errors.examDateAfterExamEnd") || "Exam date must be on or before the selected end date";
      // }
      if (!eventData.oneSupervisorOrTrainerForEvent && (!exam.supervisorId || /^\s+$/.test(exam.supervisorId)))
        newErrors[`exam_${index}_supervisorId`] = t("errors.required");
      if (!exam.place || /^\s+$/.test(exam.place))
        newErrors[`exam_${index}_place`] = t("errors.required");
    });
  }

  return newErrors;
};

