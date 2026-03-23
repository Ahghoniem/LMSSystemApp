import { useState, useCallback } from "react";
import axiosInstance from "../Constants/axiosInstance";

export function usePaymentRedirect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitPayment = useCallback(async (url, payload = {}) => {
    setLoading(true);
    setError(null);
    const handleUnload = () => {
      setLoading(false);
    };

    window.addEventListener("beforeunload", handleUnload);

    try {
      const response = await axiosInstance.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        responseType: "text",
      });

      const html = response.data;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const form = doc.querySelector("form");

      if (!form) throw new Error("No form found in the backend response");

      const tempForm = document.createElement("form");
      tempForm.method = form.method || "POST";
      tempForm.action = form.action;

      form.querySelectorAll("input").forEach((input) => {
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = input.name;
        hiddenInput.value = input.value;
        tempForm.appendChild(hiddenInput);
      });

      document.body.appendChild(tempForm);
      tempForm.submit();
    } catch (err) {
      console.error("Payment redirect failed:", err);
      setError(err.message || "Payment redirect failed");
      setLoading(false);
    } finally {
      window.removeEventListener("beforeunload", handleUnload);
    }
  }, []);

  return { submitPayment, loading, error };
}
