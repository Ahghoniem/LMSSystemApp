import { getLang } from "../../Utils";

export const arabicRegex = /^[\u0600-\u06FF\s.,\-_'"()&+]+$/;
export const englishRegex = /^[A-Za-z\s.,\-_'"()&+]+$/;
export const idRegex = /^\d{14}$/;

export const validateField = (name, value, t, nationality,password) => {
    const lang=getLang()
    let error = "";
    const isEmpty = !value || /^\s+$/.test(value);
    switch (name) {
      case "name_ar":
        if (isEmpty) error = t("errors.required");
        else if (!/^[\u0600-\u06FF\s]+$/.test(value)) error = t("errors.arabic_only");
        break;
  
      case "name_En":
        if (isEmpty) error = t("errors.required");
        else if (!/^[A-Za-z\s]+$/.test(value)) error = t("errors.english_only");
        break;
  
      case "national_id":
        if (isEmpty) error = t("errors.required");
        else if (nationality === "Egyptian | مصري" && !/^\d{14}$/.test(value))
          error = t("errors.invalid_id");
        break;
  
      case "nationalIdImage":
        if (isEmpty) error = t("errors.required");
        break;
      case "id_image_back":
        if (nationality === "Egyptian | مصري" && isEmpty) error = t("errors.required");
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
        case "ProductId":
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
        case "password":
            if (!value || /^\s+$/.test(value)) {
                error = t("passwordReq");
              } else if (value.length < 8) {
                error = t("passwordLen")
              } else if (!/[A-Z]/.test(value)) {
                error = t("passwordUpper");
              } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                error = t("passwordSpecial");
              }
              break
            case "confirmPassword":
            if (!value || /^\s+$/.test(value)) {
            error = t("confirmPassReq");
            }
            else if (value !== password) {
                error = t("passwordMatch");
            }
            break
      default:
        break;
    }
    return error;
  };
  export const validateStep1 = (formValues,t,setErrors,) => {
    const fields = ["name_ar", "name_En", "nationality", "national_id", "nationalIdImage"];
    if (formValues.nationality === "Egyptian | مصري") fields.push("id_image_back");
    let isValid = true;
    fields.forEach((f) => {
      const err = validateField(f, formValues[f], t,formValues.nationality);
      setErrors((prev) => ({ ...prev, [f]: err }));
      if (err) isValid = false;
    });
    return isValid;
  };
  export const validateStep2=(formValues,t,setErrors) => {
    const fields = ["university","faculty"];
    let isValid = true;
    fields.forEach((f) => {
      const err = validateField(f, formValues[f], t,formValues.nationality);
      setErrors((prev) => ({ ...prev, [f]: err }));
      if (err) isValid = false;
    });
    return isValid;
  }
  export const validateStep3=(formValues,t,setErrors) => {
    const fields = ["type","StudyLan","training_type","department"];
    let isValid = true;
    fields.forEach((f) => {
      const err = validateField(f, formValues[f], t,formValues.nationality);
      setErrors((prev) => ({ ...prev, [f]: err }));
      if (err) isValid = false;
    });
    return isValid;
  }
  export const validateStep4=(formValues,t,setErrors) => {
    const fields = ["password","confirmPassword","Mobile"];
    let isValid = true;
    fields.forEach((f) => {
      const err = validateField(f, formValues[f], t,formValues.nationality,formValues.password);
      setErrors((prev) => ({ ...prev, [f]: err }));
      if (err) isValid = false;
    });
    return isValid;
  }