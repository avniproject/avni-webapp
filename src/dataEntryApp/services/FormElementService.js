import { Concept, ValidationResult } from "avni-models";
import { differenceWith, find, filter, flatMap, head, isEmpty, isNil, map, remove, some } from "lodash";
import { getFormElementsStatuses } from "./RuleEvaluationService";

export default {
  updateObservations(observationsHolder, formElement, value, childFormElement, questionGroupIndex) {
    if (!isNil(childFormElement) && !isNil(childFormElement.groupUuid)) {
      if (formElement.repeatable) {
        observationsHolder.updateRepeatableGroupQuestion(questionGroupIndex, formElement, childFormElement, value);
      } else {
        observationsHolder.updateGroupQuestion(formElement, childFormElement, value);
      }
      const childObs = observationsHolder.findQuestionGroupObservation(childFormElement.concept, formElement, questionGroupIndex);
      if (childFormElement.concept.isPrimitive() && isNil(childFormElement.durationOptions)) {
        return value;
      } else {
        return childObs && childObs.getValueWrapper();
      }
    } else if (
      formElement.isMultiSelect() &&
      (formElement.concept.datatype === Concept.dataType.Coded ||
        formElement.concept.datatype === Concept.dataType.Subject ||
        formElement.concept.datatype === Concept.dataType.Image ||
        formElement.concept.datatype === Concept.dataType.Video ||
        formElement.concept.datatype === Concept.dataType.File)
    ) {
      const observation = observationsHolder.toggleMultiSelectAnswer(formElement.concept, value);
      return observation && observation.getValueWrapper();
    } else if (
      formElement.isSingleSelect() &&
      (formElement.concept.datatype === Concept.dataType.Coded ||
        formElement.concept.datatype === Concept.dataType.Subject ||
        formElement.concept.datatype === Concept.dataType.Image ||
        formElement.concept.datatype === Concept.dataType.Video ||
        formElement.concept.datatype === Concept.dataType.File)
    ) {
      const observation = observationsHolder.toggleSingleSelectAnswer(formElement.concept, value);
      return observation && observation.getValueWrapper();
    } else if (formElement.concept.datatype === Concept.dataType.Duration && !isNil(formElement.durationOptions)) {
      const observation = observationsHolder.updateCompositeDurationValue(formElement.concept, value);
      return observation && observation.getValueWrapper();
    } else if (formElement.concept.datatype === Concept.dataType.Date && !isNil(formElement.durationOptions)) {
      observationsHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
      return value;
    } else if (formElement.concept.datatype === Concept.dataType.PhoneNumber) {
      const { phoneNumber, isVerified } = value;
      observationsHolder.updatePhoneNumberValue(formElement.concept, phoneNumber, isVerified);
      return phoneNumber;
    } else {
      observationsHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
      return value;
    }
  },

  validate(formElement, value, observations, validationResults, formElementStatuses, childFormElement) {
    const isChildFormElement = !isNil(childFormElement) && childFormElement.groupUuid === formElement.uuid;
    const validationResult = isChildFormElement ? childFormElement.validate(value) : formElement.validate(value);
    isChildFormElement && validationResult.addQuestionGroupIndex(childFormElement.questionGroupIndex);
    remove(
      validationResults,
      (existingValidationResult) =>
        existingValidationResult.formIdentifier === validationResult.formIdentifier ||
        (isChildFormElement &&
          existingValidationResult.formIdentifier === childFormElement.uuid &&
          existingValidationResult.questionGroupIndex === childFormElement.questionGroupIndex),
    );
    validationResults.push(validationResult);
    const ruleValidationErrors = getRuleValidationErrors(formElementStatuses);
    const hiddenFormElementStatus = filter(formElementStatuses, (status) => status.visibility === false);
    const ruleErrorsAdded = addPreviousValidationErrors(ruleValidationErrors, validationResult, validationResults);
    remove(ruleErrorsAdded, (result) => result.success);
    return differenceWith(
      ruleErrorsAdded,
      hiddenFormElementStatus,
      (a, b) => a.formIdentifier === b.uuid && a.questionGroupIndex === b.questionGroupIndex,
    );
  },

  validateForMandatoryFieldIsEmptyOrNullOnly(formElement, value, observations, validationResults, formElementStatuses, childFormElement) {
    const isChildFormElement = !isNil(childFormElement) && childFormElement.groupUuid === formElement.uuid;
    const validationResult = isChildFormElement
      ? this.validateIfIsMandatoryAndValueEmptyOrNull(childFormElement, value)
      : this.validateIfIsMandatoryAndValueEmptyOrNull(formElement, value);
    isChildFormElement && validationResult.addQuestionGroupIndex(childFormElement.questionGroupIndex);
    remove(
      validationResults,
      (existingValidationResult) =>
        existingValidationResult.formIdentifier === validationResult.formIdentifier ||
        (isChildFormElement &&
          existingValidationResult.formIdentifier === childFormElement.uuid &&
          existingValidationResult.questionGroupIndex === childFormElement.questionGroupIndex),
    );
    validationResults.push(validationResult);
    const hiddenFormElementStatus = filter(formElementStatuses, (status) => status.visibility === false);
    const ruleErrorsAdded = addPreviousValidationErrors([], validationResult, validationResults);
    remove(ruleErrorsAdded, (result) => result.success);
    return differenceWith(
      ruleErrorsAdded,
      hiddenFormElementStatus,
      (a, b) => a.formIdentifier === b.uuid && a.questionGroupIndex === b.questionGroupIndex,
    );
  },

  validateIfIsMandatoryAndValueEmptyOrNull(formElement, value) {
    if (formElement && formElement.mandatory && isEmpty(value)) {
      return ValidationResult.failureForEmpty(formElement.uuid);
    } else {
      return ValidationResult.successful(formElement.uuid);
    }
  },
};

export function getFormElementStatuses(entity, formElementGroup, observationsHolder) {
  const formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  const filteredFormElements = formElementGroup.filterElements(formElementStatuses);
  const allFormElements = formElementGroup.getFormElements();
  const removedObs = observationsHolder.removeNonApplicableObs(allFormElements, filteredFormElements);
  if (isEmpty(removedObs)) {
    return { formElementStatuses, filteredFormElements };
  }
  return getFormElementStatuses(entity, formElementGroup, observationsHolder);
}

const getRuleValidationErrors = (formElementStatuses) => {
  return flatMap(
    formElementStatuses,
    (status) =>
      new ValidationResult(
        isEmpty(status.validationErrors),
        status.uuid,
        head(status.validationErrors),
        null,
        status.questionGroupIndex,
        ValidationResult.ValidationTypes.Rule,
      ),
  );
};

const checkValidationResult = (ruleValidationErrors, validationResult) => {
  return map(ruleValidationErrors, (error) => {
    const { formIdentifier, questionGroupIndex, success } = validationResult;
    if (
      error.formIdentifier === formIdentifier &&
      (isNil(error.questionGroupIndex) || error.questionGroupIndex === questionGroupIndex) &&
      !success
    ) {
      return validationResult;
    }
    if (error.formIdentifier === formIdentifier && isNil(error.questionGroupIndex)) error.addQuestionGroupIndex(questionGroupIndex);
    return error;
  });
};

const addPreviousValidationErrors = (ruleValidationErrors, validationResult, previousErrors) => {
  const validationResultsThatNeedToBePreserved = previousErrors.filter(
    ({ validationType }) => validationType !== ValidationResult.ValidationTypes.Rule,
  );

  // Filter out the current validationResult from previousErrors to avoid duplicates
  const filteredPreviousErrors = validationResultsThatNeedToBePreserved.filter(
    ({ formIdentifier, questionGroupIndex }) =>
      formIdentifier !== validationResult.formIdentifier ||
      (questionGroupIndex !== validationResult.questionGroupIndex && !isNil(questionGroupIndex)),
  );

  // Handle case where ruleValidationErrors is empty and validationResult.success is false
  if (isEmpty(ruleValidationErrors) && validationResult && validationResult.success === false) {
    return [...filteredPreviousErrors, validationResult];
  }

  return [...checkValidationResult(ruleValidationErrors, validationResult), ...filteredPreviousErrors];
};

export const filterFormElements = (formElementGroup, entity) => {
  let formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  return formElementGroup.filterElements(formElementStatuses);
};

export const filterFormElementStatusesAndConvertToValidationResults = (formElementGroup, entity) => {
  let formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  const filteredFE = formElementGroup.filterElements(formElementStatuses);

  // Filter form element statuses to only include those that are visible and whose parents are visible
  const filteredFeStatuses = filter(formElementStatuses, (status) => {
    // Check if the current form element is in the filtered list
    const isVisible = some(filteredFE && filteredFE.map((fe) => fe.uuid), (feUUID) => status.uuid === feUUID);

    if (!isVisible) return false;

    // Check if parent is visible (if there is a parent)
    const correspondingFormElement = find(formElementGroup.getFormElements(), (fe) => fe.uuid === status.uuid);
    if (correspondingFormElement && correspondingFormElement.groupUuid) {
      const parentStatus = find(formElementStatuses, (s) => s.uuid === correspondingFormElement.groupUuid);
      return parentStatus ? parentStatus.visibility !== false : true;
    }

    return true; // Include if no parent (top-level form element)
  });

  const ruleValidationErrors = getRuleValidationErrors(filteredFeStatuses);

  // For static form element groups, include entity validation errors
  const isStaticFormElementGroup = formElementGroup.constructor.name === "StaticFormElementGroup";
  if (isStaticFormElementGroup && entity?.validate) {
    const entityValidationErrors = entity.validate().filter((validation) => !validation.success);
    return [...ruleValidationErrors, ...entityValidationErrors];
  }

  return ruleValidationErrors;
};

export function getNonNestedFormElements(formElements) {
  const nested = [];
  formElements.forEach((x) => {
    isNil(x.group) && nested.push(x);
  });
  return nested;
}
