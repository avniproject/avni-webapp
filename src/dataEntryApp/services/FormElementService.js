import { Concept, ValidationResult, FormElementGroup } from "avni-models";
import { differenceWith, filter, flatMap, head, isEmpty, isNil, map, remove } from "lodash";
import { getFormElementsStatuses } from "./RuleEvaluationService";

export default {
  updateObservations(observationsHolder, formElement, value) {
    if (
      formElement.isMultiSelect() &&
      (formElement.concept.datatype === Concept.dataType.Coded ||
        formElement.concept.datatype === Concept.dataType.Subject)
    ) {
      const observation = observationsHolder.toggleMultiSelectAnswer(formElement.concept, value);
      return observation && observation.getValueWrapper();
    } else if (
      formElement.isSingleSelect() &&
      (formElement.concept.datatype === Concept.dataType.Coded ||
        formElement.concept.datatype === Concept.dataType.Subject)
    ) {
      const observation = observationsHolder.toggleSingleSelectAnswer(formElement.concept, value);
      return observation && observation.getValueWrapper();
    } else if (
      formElement.concept.datatype === Concept.dataType.Duration &&
      !isNil(formElement.durationOptions)
    ) {
      const observation = observationsHolder.updateCompositeDurationValue(
        formElement.concept,
        value
      );
      return observation && observation.getValueWrapper();
    } else if (
      formElement.concept.datatype === Concept.dataType.Date &&
      !isNil(formElement.durationOptions)
    ) {
      observationsHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
      return value;
    } else {
      observationsHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
      return value;
    }
  },

  validate(formElement, value, observations, validationResults, formElementStatuses) {
    const validationResult = formElement.validate(value);
    remove(
      validationResults,
      existingValidationResult =>
        existingValidationResult.formIdentifier === validationResult.formIdentifier
    );
    validationResults.push(validationResult);
    const ruleValidationErrors = getRuleValidationErrors(formElementStatuses);
    const hiddenFormElementStatus = filter(
      formElementStatuses,
      status => status.visibility === false
    );
    const ruleErrorsAdded = addPreviousValidationErrors(
      ruleValidationErrors,
      validationResult,
      validationResults
    );
    remove(ruleErrorsAdded, result => result.success);
    return differenceWith(
      ruleErrorsAdded,
      hiddenFormElementStatus,
      (a, b) => a.formIdentifier === b.uuid
    );
  }
};

export const getFormElementStatuses = (entity, formElementGroup, observationsHolder) => {
  const formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  const filteredFormElements = FormElementGroup._sortedFormElements(
    formElementGroup.filterElements(formElementStatuses)
  );
  const removedObs = observationsHolder.removeNonApplicableObs(
    formElementGroup.getFormElements(),
    filteredFormElements
  );
  if (isEmpty(removedObs)) {
    return formElementStatuses;
  }
  return getFormElementStatuses(entity, formElementGroup, observationsHolder);
};

const getRuleValidationErrors = formElementStatuses => {
  return flatMap(
    formElementStatuses,
    status =>
      new ValidationResult(
        isEmpty(status.validationErrors),
        status.uuid,
        head(status.validationErrors)
      )
  );
};

const checkValidationResult = (ruleValidationErrors, validationResult) => {
  return map(ruleValidationErrors, error =>
    error.formIdentifier === validationResult.formIdentifier && !validationResult.success
      ? validationResult
      : error
  );
};

const addPreviousValidationErrors = (ruleValidationErrors, validationResult, previousErrors) => {
  const otherFEFailedStatuses = previousErrors.filter(
    ({ formIdentifier, success }) => validationResult.formIdentifier !== formIdentifier && !success
  );
  return [
    ...checkValidationResult(ruleValidationErrors, validationResult),
    ...otherFEFailedStatuses
  ];
};

export const filterFormElements = (formElementGroup, entity) => {
  let formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  return formElementGroup.filterElements(formElementStatuses);
};
