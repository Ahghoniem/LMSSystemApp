import { getLang } from "../../../../Utils";


export const arabicRegex = /^[\u0600-\u06FF\s]+$/;
export const englishRegex = /^[A-Za-z\s]+$/;
export const idRegex = /^\d{14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateField = (name, value, t, nationality) => {
    const lang=getLang()
    let error = "";
    const isEmpty = !value || /^\s+$/.test(value);
    switch (name) {
      case "fullName":
        if (isEmpty) error = t("errors.required");
        else if (!/^[\u0600-\u06FF\s]+$/.test(value)) error = t("errors.arabic_only");
        break;
      case "NameEn":
        if (isEmpty) error = t("errors.required");
        else if (!/^[A-Za-z\s]+$/.test(value)) error = t("errors.english_only");
        break;
        case "email":
            if (isEmpty) error = t("errors.required");
            else if(!emailRegex.test(value))
            error =t("emailInvalid")
        break
      case "nationalId":
        {
          if (isEmpty) error = t("errors.required");
        
        else if (nationality === "Egyptian | مصري" && !/^\d{14}$/.test(value))
        error = t("errors.invalid_id");
        console.log(nationality);
        }
        break;
      case "nationality":
        if (isEmpty) error = t("errors.required");
        break;
        case "university":
        if (isEmpty) error = t("errors.required");
        break
        case "faculty":
        if (isEmpty) error = t("errors.required");
        break
        case "type":
        if (isEmpty) error = t("errors.required");
        break
        case "department":
        if (isEmpty) error = t("errors.required");
        else if(!englishRegex.test(value) && lang !== "ar") error=t("errors.english_only")
        else if(!arabicRegex.test(value) && lang === "ar") error=t("errors.arabic_only")
        break
        case "StudyLan":
        if (isEmpty) error = t("errors.required");
        break
        case "training_type":
        if (isEmpty) error = t("errors.required");
        break
        case "Mobile":
       {
        if (isEmpty) error = t("errors.required");
        const regex = /^\+?\d*$/;
         if (!regex.test(value))
        {
            error=t("Mobile.not_mobile")
        }
       
       }
        break
      default:
        break;
    }
    return error;
  };