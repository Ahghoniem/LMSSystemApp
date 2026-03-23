import { getAuth } from "../../Utils";

export function getInitialFormValues() {
  return {
    name_ar: "",
    name_En: "",
    nationality: "",
    national_id: "",
    nationalIdImage: null,
    id_image_back: null,
    university: "",
    faculty: "",
    department: "",
    type: "",
    ProductId: "",
    StudyLan: "",
    Mobile: "",
    password: "",
    confirmPassword: "",
    OCR: true,
    email: getAuth() || "", 
  };
}

export const ClearValue = {
    name_ar: "",
    name_En: "",
    nationality:"",
    national_id: "",
    nationalIdImage: null,
    id_image_back: null,
    university: "",
    faculty: "",
    department: "",
    type: "",
    ProductId: "",
    StudyLan: "",
    Mobile: "",
    password: "",
    confirmPassword: "",
    OCR:true,
    email:""
  };
