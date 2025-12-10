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
      if (!formElement || !formElement.name) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const validationResult = await difyFormValidationService.validateSingleFormElement(
          formElement,
          formType,
          { subjectTypeType }, // Pass subjectTypeType in formContext
          requestType,
        );

        // Handle different response formats based on requestType
        if (requestType === "VisitSchedule") {
          // For VisitSchedule, pass the structured response directly
          onSuccess(validationResult);
        } else {
          // For FormValidation, handle array of validation results
          if (validationResult && validationResult.length > 0) {
            const warningMessages = validationResult.map((v) => v.message).join("\n\n");
            onSuccess(warningMessages);
          } else {
            onSuccess(null); // Clear warning if no validation issues
          }
        }
      } catch (err) {
        console.error("Form validation failed:", err);
        setError(err.message);
        onSuccess(null); // Fallback to no warnings on error
      } finally {
        setIsLoading(false);
      }
    },
    [formType, subjectTypeType],
  );

  const validateBatchFormElements = useCallback(
    async (formElements, onSuccess) => {
      if (!formElements || formElements.length === 0) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const validationResults = await difyFormValidationService.validateBatchFormElements(formElements, formType);

        onSuccess(validationResults);
      } catch (err) {
        console.error("Batch form validation failed:", err);
        setError(err.message);
        onSuccess(formElements.map(() => [])); // Fallback to empty warnings for all elements
      } finally {
        setIsLoading(false);
      }
    },
    [formType],
  );

  const debouncedValidateFormElement = useCallback(
    (formElement, onSuccess, requestType) => {
      if (debouncedValidatorRef.current) {
        debouncedValidatorRef.current.cancel();
      }

      debouncedValidatorRef.current = difyFormValidationService.createDebouncedValidator(
        () => validateFormElement(formElement, onSuccess, requestType),
        500, // 500ms debounce as specified
      );

      debouncedValidatorRef.current();
    },
    [validateFormElement],
  );

  const debouncedValidateBatchFormElements = useCallback(
    (formElements, onSuccess) => {
      if (debouncedValidatorRef.current) {
        debouncedValidatorRef.current.cancel();
      }

      debouncedValidatorRef.current = difyFormValidationService.createDebouncedValidator(
        () => validateBatchFormElements(formElements, onSuccess),
        500, // 500ms debounce as specified
      );

      debouncedValidatorRef.current();
    },
    [validateBatchFormElements],
  );

  const clearValidationCache = useCallback((requestType = null) => {
    difyFormValidationService.clearCache(requestType);
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
