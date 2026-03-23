import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import styles from "./RegisterForm.module.css";
import { API_BASE_URL } from "../../Constants/index";
import { ClearValue, getInitialFormValues } from "./formInitialValues";
import {
  validateField,
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
} from "./validators";
import ProgressBar from "./ProgressBar";
import Step1Personal from "./Steps/Step1Personal";
import Step2University from "./Steps/Step2University";
import Step3Study from "./Steps/Step3Study";
import Step4Account from "./Steps/Step4Account";
import {
  Compare,
  convertFileToBase64,
  deleteAuth,
  deleteStatus,
} from "../../Utils";
import sendOcrRequest from "./Service/OCR";
import Popup from "./../../Components/Popup/Popup";
import { useNavigate } from "react-router";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterForm() {
  const { t } = useTranslation("register");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [studyType, setStudyType] = useState("");
  const res = useRef(null);
  const count = useRef(0);
  const prevIdBackImageRef = useRef(null);
  const [TrainingType, SetTrainingType] = useState([]);
  const [formValues, setFormValues] = useState(getInitialFormValues());
  const [errors, setErrors] = useState({});
  const ocrPromiseRef = useRef(null);
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    message: "",
    hasButtons: true,
  });

  const formSteps = ["personal", "university", "study", "account"];

  const handleChildData = (data) => {
    console.log(data);

    if (data) {
      setPopup({
        open: true,
        type: "warning",
        message: t("Popup.Warning"),
        hasButtons: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    const fieldValue = files ? files[0] : value;
    setFormValues((prev) => ({ ...prev, [name]: fieldValue }));
    const err = validateField(
      name,
      fieldValue,
      t,
      formValues.nationality,
      formValues.password
    );
    setErrors((prev) => ({ ...prev, [name]: err }));
  };


  const handleTypeChange = async (e) => {
    const { value, name } = e.target;
    const selectedType = value;
    setFormValues((prev) => ({ ...prev, type: selectedType }));
    const err = validateField(name, value, t, formValues.nationality);
    setErrors((prev) => ({ ...prev, [name]: err }));
    setStudyType(selectedType);
    try {
      const response = await axios.get(
        `${API_BASE_URL}products?userType=${selectedType}`
      );
      console.log(response);

      SetTrainingType(response.data?.data?.data);
    } catch (error) {
      console.error("Error fetching data from backend:", error);
    }
  };

  const nextStep = async () => {
    if (currentStep === 0 && !validateStep1(formValues, t, setErrors)) return;
    if (currentStep === 1 && !validateStep2(formValues, t, setErrors)) return;
    if (currentStep === 2 && !validateStep3(formValues, t, setErrors)) return;
    setCurrentStep((s) => Math.min(s + 1, formSteps.length - 1));
    const changed = handleCheckImageChange();
    if (currentStep === 0 && formValues.id_image_back && changed) {
      try {
        const runOCR = async () => {
          const base64Image = await convertFileToBase64(
            formValues.id_image_back
          );
          return sendOcrRequest(base64Image);
        };
        ocrPromiseRef.current = runOCR();
        ocrPromiseRef.current
        .then((result) => {
            console.log(result);
            res.current = result;
          })
          .catch((err) => {
            console.error("OCR background error:", err);
          });
      } catch (err) {
        console.error("Step 1 background method error:", err);
      }
    }
  };

  const handleCheckImageChange = () => {
    const prevValue = prevIdBackImageRef.current;
    const currentValue = formValues.id_image_back;
    if (prevValue !== currentValue || !currentValue) {
      if (currentValue) {
        prevIdBackImageRef.current = currentValue;
      }
      return true;
    } else {
      return false;
    }
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep4(formValues, t, setErrors)) return;
    if (formValues.id_image_back) {
      if (ocrPromiseRef.current) {
        setLoading(true);
        res.current = await ocrPromiseRef.current;
      }
      if (Compare(res.current, formValues.national_id)) {
        count.current = 0;
        const formData = new FormData();
        Object.entries(formValues).forEach(([key, value]) => {
          if (key === "universityId" || key === "id_image_back") return;
          formData.append(key, value);
        });
        try {
          await axios.post(`${API_BASE_URL}register`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          setFormValues(ClearValue);
          deleteAuth();
          deleteStatus();
          setPopup({ open: true, type: "success", message: t("OCR.Success") });
          setTimeout(() => {
            navigate("/login");
          }, 7000);
        } catch (error) {
          setLoading(false);
          toast.error(error.response.data.message, {
            position: "top-center",
            style: { backgroundColor: "red", color: "white" },
            duration: 4000,
          });
        }
      } else {
        if (count.current < 2) {
          setCurrentStep(0);
          setFormValues((prev) => ({
            ...prev,
            id_image_back: null,
            nationalIdImage: null,
          }));
          setPopup({ open: true, type: "error", message: t("OCR.Error") });
          count.current += 1;
        } else {
          const formData = new FormData();
          Object.entries(formValues).forEach(([key, value]) => {
            if (key === "universityId" || key === "id_image_back") return;
            if (key === "OCR") value = false;
            formData.append(key, value);
          });
          console.log(formData.get("OCR"));

          try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}register`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
            setFormValues(ClearValue);
            deleteAuth();
            deleteStatus();
            setPopup({
              open: true,
              type: "warning",
              message: t("OCR.Warning"),
            });
            setTimeout(() => {
              navigate("/login");
            }, 7000);
          } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message, {
              position: "top-center",
              style: { backgroundColor: "red", color: "white" },
              duration: 4000,
            });
          }
        }
      }
    } else {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (key === "universityId" || key === "tempData") return;
        formData.append(key, value);
      });
      try {
        setLoading(true);
        await axios.post(`${API_BASE_URL}register`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setPopup({ open: true, type: "success", message: t("OCR.Success") });
        setFormValues(ClearValue);
        deleteAuth();
        deleteStatus();
        setTimeout(() => {
          navigate("/login");
        }, 7000);
      } catch (error) {
        setLoading(false);
        toast.error(error.response.data.message, {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
          duration: 4000,
        });
      }
    }
  };
  return (
    <div className={styles.body}>
      <main className={styles.auth}>
        <div className={styles.authCard}>
          <h1 className={`${styles.title} font-bold`}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>

          <ProgressBar
            steps={t("steps", { returnObjects: true })}
            currentStep={currentStep}
          />

          <form onSubmit={handleSubmit}>
            {currentStep === 0 && (
              <Step1Personal
                errors={errors}
                formValues={formValues}
                handleInputChange={handleInputChange}
                t={t}
              />
            )}

            {currentStep === 1 && (
              <Step2University
                errors={errors}
                formValues={formValues}
                handleInputChanges={handleInputChange}
                t={t}
                sendDataToParent={handleChildData}
              />
            )}

            {currentStep === 2 && (
              <Step3Study
                t={t}
                errors={errors}
                formValues={formValues}
                handleInputChange={handleInputChange}
                studyType={studyType}
                TrainingType={TrainingType}
                handleTypeChange={handleTypeChange}
              />
            )}

            {currentStep === 3 && (
              <Step4Account
                t={t}
                errors={errors}
                formValues={formValues}
                handlInputChange={handleInputChange}
              />
            )}

            <div className={styles.btns}>
              <button
                type="button"
                className={styles.btn}
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                {t("buttons.previous")}
              </button>

              {currentStep < formSteps.length - 1 && (
                <button type="button" className={styles.btn} onClick={nextStep}>
                  {t("buttons.next")}
                </button>
              )}
              {currentStep === formSteps.length - 1 && (
                <button className={styles.btn} disabled={loading} type="submit">
                  {!loading ? (
                    t("buttons.submit")
                  ) : (
                    <div className={styles.load}>
                      <span>{t("loading")}</span>
                      <ClipLoader size={18} color="#fff" />
                    </div>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
      <Popup
        isOpen={popup.open}
        type={popup.type}
        message={popup.message}
        hasButtons={popup.hasButtons}
        to={"/"}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
      />
      <Toaster />
    </div>
  );
}
