import { concatLang } from "../../../Utils";

// Form data preparation helpers
export const prepareTrainingFormData = (eventData, relatedTo) => {
  const updatedCourseTrainers =Array.isArray(eventData.courseTrainers)
      ?eventData.courseTrainers.map((item) => ({
          ...item,
          trainerId: item.trainerId ? item.trainerId : eventData.trainerId
        }))
      : [];
  return {
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    capacity: parseInt(eventData.capacity),

    ...(relatedTo === "Package"? { courses: updatedCourseTrainers }: { trainerId: eventData.trainerId }),
    ...(relatedTo === "Package"? { packageId: eventData.courseId }: { courseId: eventData.courseId }),
    startDateRes: eventData.startDateRes,
    endDateRes: eventData.endDateRes,
    eventName: concatLang(eventData.eventNameEn, eventData.eventName),
    productId: eventData.productId,
    language:eventData.eventLanguage
  };
};


export const prepareExamFormData = (eventData) => {
  const startDateRes = formatExamDate(eventData.startDateRes, 9, 0, 0);
  const endDateRes = formatExamDate(eventData.endDateRes, 9, 0, 0);
  const examDate = formatExamDate(eventData.date, 9, 0, 0);
  const examStartDate = formatExamDate(eventData.date, 9, 0, 0);
  const examEndDate = formatExamDate(eventData.date, 12, 0, 0);

  return {
    startDateRes,
    endDateRes,
    startDate: examStartDate,
    endDate: examEndDate,
    courseId: eventData.courseId,
    capacity: parseInt(eventData.capacity),
    supervisorId: eventData.supervisorId,
    place: eventData.place,
    date: examDate,
    eventName: concatLang(eventData.eventNameEn, eventData.eventName),
    productId: eventData.productId,
    eventNameEn: eventData.eventNameEn,
    language:eventData.eventLanguage
  };
};


// Format exam date - set time to specified hours for start and end
const formatExamDate = (dateString, hours = 9, minutes = 0, seconds = 0) => {
  if (!dateString) return null;
  try {
    const parts = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!parts) return null;
    const year = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    const day = parseInt(parts[3], 10);
    const date = new Date(Date.UTC(year, month, day));
    if (isNaN(date.getTime())) return null;
    date.setUTCHours(hours, minutes, seconds, 0);
    const utcYear = date.getUTCFullYear();
    const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const m = String(date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    return `${utcYear}-${utcMonth}-${utcDay}T${h}:${m}:${s}Z`;
  } catch (error) {
    console.error("Error formatting exam date:", dateString, error);
    return null;
  }
};

// Format date to YYYY-MM-DD only (no time)
const formatDateOnly = (dateString) => {
  if (!dateString) return null;
  try {
    const parts = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!parts) return null;
    return `${parts[1]}-${parts[2]}-${parts[3]}`;
  } catch (error) {
    console.error("Error formatting date only:", dateString, error);
    return null;
  }
};

export const preparePackageExamData = (eventData) => {
  const startDateRes = formatExamDate(eventData.startDateRes, 9, 0, 0);
  const endDateRes = formatExamDate(eventData.endDateRes, 9, 0, 0);
  
  const baseEventName = concatLang(eventData.eventNameEn, eventData.eventName);
  
  const courses = [];
  for (let i = 0; i < eventData.exams.length; i++) {
    const courseId = eventData.exams[i].name;
    
    const courseDate = formatDateOnly(eventData.exams[i].date);
    if (!courseId || !courseDate) {
      console.error(`Missing required field for exam ${i + 1}:`, {
        courseId,
        courseDate,
        examDateRaw: eventData.exams[i].date,
      });
      continue;
    }

    const supervisorId =
      eventData.exams[i].supervisorId || eventData.supervisorId;
    const place = eventData.exams[i].place || eventData.place;
    courses.push({
      courseId,
      date: courseDate,
      place,
      supervisorId,
    });
  }
  const language=eventData.eventLanguage
  const courseDates = courses.map(c => c.date).filter(Boolean).sort();
  const firstDate = courseDates[0] ? formatExamDate(courseDates[0], 9, 0, 0) : null;
  const lastDate = courseDates[courseDates.length - 1] ? formatExamDate(courseDates[courseDates.length - 1], 12, 0, 0) : null;

  const requestData = {
    packageId: eventData.selectedPackage,
    eventName: baseEventName,
    capacity: parseInt(eventData.capacity),
    startDate: firstDate,
    endDate: lastDate,
    startDateRes,
    endDateRes,
    productId: eventData.productId,
    courses,
    language
  };


  Object.keys(requestData).forEach(key => {
    if (requestData[key] === null || requestData[key] === undefined) {
      delete requestData[key];
    }
  });

  return requestData;
};