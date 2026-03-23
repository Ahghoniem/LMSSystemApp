import { jwtDecode } from "jwt-decode";
import React from "react";
import { FaBoxOpen, FaFileAlt, FaGraduationCap } from "react-icons/fa";
export const setAuth = (data) => {
  localStorage.setItem("email", JSON.stringify(data));
};

export const getAuth = () => {
  if (localStorage.getItem("email")) {
    return JSON.parse(localStorage.getItem("email"));
  }
};
export const deleteAuth = () => {
  if (localStorage.getItem("email")) {
    localStorage.removeItem("email");
  }
};
export const setStatus = (status) => {
  localStorage.setItem("status", JSON.stringify(status));
};
export const getStatus = () => {
  if (localStorage.getItem("status")) {
    return JSON.parse(localStorage.getItem("status"));
  }
};
export const deleteStatus = () => {
  if (localStorage.getItem("status")) {
    localStorage.removeItem("status");
  }
};
export function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const rawBase64 = result.split(",")[1];
      resolve(rawBase64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
export const getLang = () => {
  if (sessionStorage.getItem("lang")) {
    return sessionStorage.getItem("lang");
  }
};

export const Compare = (result, id) => {
  return result === id;
};
export function concatLang(en, ar) {
  if (!en && !ar) return null;
  return `${en || ""} | ${ar || ""}`.trim();
}

export const setToken = (data, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem("token", JSON.stringify(data));
  }
  sessionStorage.setItem("token", JSON.stringify(data));
};

export const getToken = () => {
  if (sessionStorage.getItem("token")) {
    return JSON.parse(sessionStorage.getItem("token"));
  }
  if (localStorage.getItem("token")) {
    return JSON.parse(localStorage.getItem("token"));
  }
};

export const deleteToken = () => {
  if (sessionStorage.getItem("token")) {
    sessionStorage.removeItem("token");
  }
  if (localStorage.getItem("token")) {
    localStorage.removeItem("token");
  }
};
export const Decode_Token = () => {
  const token = getToken();
  if (!token || typeof token !== "string") {
    console.warn("Invalid token: must be a string");
    return null;
  }

  let userData = null;
  try {
    userData = jwtDecode(token); // decode directly
  } catch (error) {
    console.error("Failed to decode token:", error);
  }

  return userData;
};
export const Decode_Session_Token = (token) => {
  if (!token || typeof token !== "string") {
    console.warn("Invalid token: must be a string");
    return null;
  }
  let userData = null;
  try {
    userData = jwtDecode(token); // decode directly
  } catch (error) {
    console.error("Failed to decode token:", error);
  }

  return userData;
};

export function formatDateOnly(isoString, lang = "en") {
  const date = new Date(isoString);

  if (lang === "ar") {
    // Arabic locale
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } else {
    // English locale, format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
export function splitLang(value) {
  if (!value) return { en: null, ar: null };
  const [en, ar] = value.split("|").map((v) => v.trim());
  return { en, ar };
}
export const capitalizeFirst = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export function addOneDay(dateString) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export const flattenObject = (obj, parentKey = "", result = {}) => {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}_${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenObject(value, newKey, result); // recurse
    } else {
      result[newKey] = value;
    }
  }
  return result;
};
export const flattenEvents = (arr) => arr.map((event) => flattenObject(event));

export function getObjectById(array, id) {
  return array.find((item) => item.userId === id);
}
export function getObjectByIdTrain(array, id) {
  return array.find((item) => item.User.userId === id);
}
export function formatDateTime(dateStr, lang = "en") {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  // If today
  if (isToday) {
    if (diffSecs < 60) {
      return lang === "ar"
        ? `منذ ${diffSecs} ثانية`
        : `${diffSecs} second${diffSecs !== 1 ? "s" : ""} ago`;
    } else if (diffMins < 60) {
      return lang === "ar"
        ? `منذ ${diffMins} دقيقة`
        : `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else {
      return lang === "ar"
        ? `منذ ${diffHours} ساعة`
        : `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    }
  }

  // If yesterday
  if (isYesterday) {
    return lang === "ar" ? "أمس" : "Yesterday";
  }

  // Else (older dates)
  const formatter = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formatter.format(date);
}

export function getRelatedMessages(messages, tokenId) {
  return messages.filter((message) => message.id === tokenId);
}
export function extractValues(arr) {
  return arr.map((obj) => obj.value);
}

function getArabicPhrase(typeWord, number) {
  const words = {
    1: `واحد ${typeWord}`,
    2: `${typeWord}ين`,
    3: `ثلاث ${typeWord}ات`,
    4: `أربع ${typeWord}ات`,
    5: `خمس ${typeWord}ات`,
    6: `ست ${typeWord}ات`,
    7: `سبع ${typeWord}ات`,
    8: `ثمان ${typeWord}ات`,
    9: `تسع ${typeWord}ات`,
    10: `عشر ${typeWord}ات`,
  };
  return words[number] || `${number} ${typeWord}ات`;
}
export function getTypeString(lang, type, number) {
  if (lang === "ar") {
    const typeWord = type === "exam" ? "امتحان" : "تدريب";
    const arabicPhrase = getArabicPhrase(typeWord, number);
    const packageWord = type === "exam" ? "حزمة امتحانات" : "حزمة تدريبات";
    return `${packageWord} ${arabicPhrase}`;
  } else {
    const pluralType = type === "exam" ? "Exams" : "Trainings";
    const capitalizedType = type === "exam" ? "Exam" : "Training";
    return `${capitalizedType} Package of ${number} ${pluralType}`;
  }
}
export function getTypeIcon(type) {
  let Icon;
  switch (type) {
    case "training":
      Icon = FaGraduationCap;
      break;
    case "exam":
      Icon = FaFileAlt;
      break;
    default:
      Icon = FaBoxOpen;
  }

  // ✅ Create element without JSX
  return React.createElement(Icon, { size: 20 });
}

export function getDuration(startTime, endTime, lang = "en") {
  // Parse times
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  // Convert to minutes
  let startTotal = startH * 60 + startM;
  let endTotal = endH * 60 + endM;

  // Handle next-day end time (crossing midnight)
  if (endTotal < startTotal) {
    endTotal += 24 * 60;
  }

  const diff = endTotal - startTotal;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  // Arabic version
  if (lang === "ar") {
    if (hours === 0) return `${minutes} دقيقة`;
    if (minutes === 0) return `${hours} ساعة`;
    return `${hours} ساعة و ${minutes} دقيقة`;
  }

  // English version
  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} hours`;
  return `${hours} hours and ${minutes} minutes`;
}

export function to12Hour(time24, lang = "en") {
  if (!time24) return "";

  // Extract hours + minutes
  const [h, m] = time24.split(":").map(Number);

  const suffixEn = h >= 12 ? "PM" : "AM";
  const suffixAr = h >= 12 ? "م" : "ص";

  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12; // 00 → 12 AM, 12 → 12 PM

  const formatted = `${hour12}:${String(m).padStart(2, "0")}`;

  return lang === "ar"
    ? `${formatted} ${suffixAr}`
    : `${formatted} ${suffixEn}`;
}

export const normalize = (arr) =>
  Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "object"
    ? arr.map((u) => u.userType)
    : arr;

export function formatDateTimeLogs(dateStr, lang = "en") {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  // Check if today
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  // If today → relative time
  if (isToday) {
    if (diffSecs < 60) {
      return lang === "ar"
        ? `منذ ${diffSecs} ثانية`
        : `${diffSecs} second${diffSecs !== 1 ? "s" : ""} ago`;
    } else if (diffMins < 60) {
      return lang === "ar"
        ? `منذ ${diffMins} دقيقة`
        : `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else {
      return lang === "ar"
        ? `منذ ${diffHours} ساعة`
        : `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    }
  }

  // If yesterday → "Yesterday HH:MM AM/PM" or Arabic equivalent
  if (isYesterday) {
    const timeFormatter = new Intl.DateTimeFormat(
      lang === "ar" ? "ar-EG" : "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );

    const timeStr = timeFormatter.format(date);
    return lang === "ar" ? `أمس ${timeStr}` : `Yesterday ${timeStr}`;
  }

  // Else → full date
  const formatter = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formatter.format(date);
}
export const formatNowDateTime = (lang = "en") => {
  const now = new Date();

  const locale = lang === "ar" ? "ar-EG" : "en-US";

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const date = dateFormatter.format(now);
  const time = timeFormatter.format(now);

  return `${date} - ${time}`;
};
export const handleFileResponse = (
  axiosResponse,
  fileName = null,
  openInNewTab = true
) => {
  try {
    const blob = new Blob([axiosResponse.data], {
      type: axiosResponse.headers["content-type"] || "application/octet-stream",
    });
    const fileURL = window.URL.createObjectURL(blob);
    const mimeType = blob.type;
    const canOpenInTab =
      mimeType.startsWith("application/pdf") || mimeType.startsWith("image/");
    if (openInNewTab && canOpenInTab) {
      const newTab = window.open(fileURL, "_blank");
      if (!newTab) {
        alert("Please allow popups for this website");
      }
    }

    if (fileName) {
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName;
      link.click();
    }
    setTimeout(() => window.URL.revokeObjectURL(fileURL), 10000);
  } catch (err) {
    console.error("Error handling file response:", err);
  }
};
export const addMinutes = (time, minutes) => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m + minutes, 0, 0);

  return date.toTimeString().slice(0, 5); // HH:mm
};
export const getNextDayForInput = (dateInput) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getChangedItems = (original = [], edited = []) => {
  const changed = [];

  edited.forEach((item, index) => {
    const originalItem = original[index];

    if (!originalItem) {
      changed.push(item);
      return;
    }

    if (JSON.stringify(item) !== JSON.stringify(originalItem)) {
      changed.push(item);
    }
  });

  return changed;
};


const browserRegexMap = [
  { name: "Edge", regex: /edg/i },
  { name: "Opera", regex: /opr|opera/i },
  { name: "Chrome", regex: /chrome/i },
  { name: "Firefox", regex: /firefox/i },
  { name: "Safari", regex: /safari/i },
];

const mobileRegex = /mobile|android|iphone|ipad/i;

export const parseUserAgentAdvanced = (ua, lang = "en") => {
  if (!ua) return "";
  let browser = "Unknown";
  for (const item of browserRegexMap) {
    if (item.regex.test(ua)) {
      browser = item.name;
      break;
    }
  }
  if (browser === "Safari" && /chrome/i.test(ua)) {
    browser = "Chrome";
  }

  const isMobile = mobileRegex.test(ua);

  if (lang === "ar") {
    return `${browser} من ${isMobile ? "موبايل" : "كمبيوتر"}`;
  }

  return `${browser} from ${isMobile ? "Mobile" : "PC"}`;
};

export function getErrorMessage(response, lang = 'en') {
  const defaultMessage = {
    en: "Failed to upload file",
    ar: "فشل تحميل الملف",
  };

  const message = response?.message;
  const details = response?.details;

  if (!message && !details) {
    return defaultMessage[lang] || defaultMessage['en'];
  }

  // Split message by language, fallback to default if missing
  const [enMessage = defaultMessage.en, arMessage = defaultMessage.ar] =
    message ? message.split(" | ") : [defaultMessage.en, defaultMessage.ar];

  const baseMessage = lang === 'ar' ? arMessage : enMessage;

  // If details exist and nationalId is present, append only its value
  if (details && details.nationalId) {
    return `${baseMessage} - ${details.nationalId}`;
  }

  return baseMessage;
}