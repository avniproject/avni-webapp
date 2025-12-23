import { useState, useCallback, useRef, useEffect } from "react";
import difyFormValidationService from "../common/services/difyFormValidationService";

export const useDifyFormValidation = (formType, apiKey, subjectTypeType) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedValidatorRef = useRef(null);

  useEffect(() => {
    if (apiKey) {
      difyFormValidationService.setApiKey(apiKey);
    }
  }, [apiKey]);

  const validateFormElement = useCallback(
    async (formElement, onSuccess, requestType = "FormValidation") => {
      // Defensive: ensure onSuccess is a function
      const safeOnSuccess = typeof onSuccess === "function" ? onSuccess : () => {};

      // Defensive: validate formElement exists and has required properties
      if (!formElement || !formElement.name) {
        safeOnSuccess(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const validationResult = await difyFormValidationService.validateSingleFormElement(
          formElement,
          formType || "",
          { subjectTypeType: subjectTypeType || "" }, // Pass subjectTypeType in formContext with fallback
          requestType,
        );

        // Handle different response formats based on requestType
        if (requestType === "VisitSchedule") {
          // For VisitSchedule, pass the structured response directly
          safeOnSuccess(validationResult);
        } else {
          // For FormValidation, handle array of validation results with defensive checks
          if (validationResult && Array.isArray(validationResult) && validationResult.length > 0) {
            const warningMessages = validationResult
              .filter((v) => v && v.message) // Filter out invalid entries
              .map((v) => v.message)
              .join("\n\n");
            safeOnSuccess(warningMessages || null);
          } else {
            safeOnSuccess(null); // Clear warning if no validation issues
          }
        }
      } catch (err) {
        // Silent failure - log but don't break the app
        console.warn("Form validation failed (non-critical):", err?.message || err);
        setError(err?.message || "Validation failed");
        safeOnSuccess(null); // Fallback to no warnings on error
      } finally {
        setIsLoading(false);
      }
    },
    [formType, subjectTypeType],
  );

  const validateBatchFormElements = useCallback(
    async (formElements, onSuccess) => {
      // Defensive: ensure onSuccess is a function
      const safeOnSuccess = typeof onSuccess === "function" ? onSuccess : () => {};

      // Defensive: validate formElements exists and is an array
      if (!formElements || !Array.isArray(formElements) || formElements.length === 0) {
        safeOnSuccess([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const validationResults = await difyFormValidationService.validateBatchFormElements(formElements, formType || "");

        // Defensive: ensure we return an array
        safeOnSuccess(Array.isArray(validationResults) ? validationResults : formElements.map(() => []));
      } catch (err) {
        // Silent failure - log but don't break the app
        console.warn("Batch form validation failed (non-critical):", err?.message || err);
        setError(err?.message || "Batch validation failed");
        safeOnSuccess(formElements.map(() => [])); // Fallback to empty warnings for all elements
      } finally {
        setIsLoading(false);
      }
    },
    [formType],
  );

  const debouncedValidateFormElement = useCallback(
    (formElement, onSuccess, requestType) => {
      try {
        // Defensive: cancel existing debounced call safely
        if (debouncedValidatorRef.current && typeof debouncedValidatorRef.current.cancel === "function") {
          debouncedValidatorRef.current.cancel();
        }

        debouncedValidatorRef.current = difyFormValidationService.createDebouncedValidator(
          () => validateFormElement(formElement, onSuccess, requestType),
          500, // 500ms debounce as specified
        );

        if (typeof debouncedValidatorRef.current === "function") {
          debouncedValidatorRef.current();
        }
      } catch (err) {
        // Silent failure - validation is non-critical
        console.warn("Debounced validation setup failed (non-critical):", err?.message || err);
      }
    },
    [validateFormElement],
  );

  const debouncedValidateBatchFormElements = useCallback(
    (formElements, onSuccess) => {
      try {
        // Defensive: cancel existing debounced call safely
        if (debouncedValidatorRef.current && typeof debouncedValidatorRef.current.cancel === "function") {
          debouncedValidatorRef.current.cancel();
        }

        debouncedValidatorRef.current = difyFormValidationService.createDebouncedValidator(
          () => validateBatchFormElements(formElements, onSuccess),
          500, // 500ms debounce as specified
        );

        if (typeof debouncedValidatorRef.current === "function") {
          debouncedValidatorRef.current();
        }
      } catch (err) {
        // Silent failure - validation is non-critical
        console.warn("Debounced batch validation setup failed (non-critical):", err?.message || err);
      }
    },
    [validateBatchFormElements],
  );

  const clearValidationCache = useCallback((requestType = null) => {
    try {
      difyFormValidationService.clearCache(requestType);
    } catch (err) {
      // Silent failure - cache clearing is non-critical
      console.warn("Clear validation cache failed (non-critical):", err?.message || err);
    }
  }, []);

  return {
    validateFormElement: debouncedValidateFormElement,
    validateBatchFormElements: debouncedValidateBatchFormElements,
    isLoading,
    error,
    clearValidationCache,
  };
};

export default useDifyFormValidation;
