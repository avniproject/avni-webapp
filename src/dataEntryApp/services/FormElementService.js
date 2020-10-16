import { Concept, ObservationsHolder, ValidationResult, FormElementGroup } from "avni-models";
import { differenceWith, filter, flatMap, head, isEmpty, isNil, map, remove } from "lodash";
import { getFormElementsStatuses } from "./RuleEvaluationService";

export default {
  updateObservations(observations = [], formElement, value) {
    const observationHolder = new ObservationsHolder(observations);
    if (formElement.concept.datatype === Concept.dataType.Coded && formElement.isMultiSelect()) {
      const answer = observationHolder.toggleMultiSelectAnswer(formElement.concept, value);
    } else if (
      formElement.concept.datatype === Concept.dataType.Coded &&
      formElement.isSingleSelect()
    ) {
      observationHolder.toggleSingleSelectAnswer(formElement.concept, value);
    } else if (
      formElement.concept.datatype === Concept.dataType.Duration &&
      !isNil(formElement.durationOptions)
    ) {
      observationHolder.updateCompositeDurationValue(formElement.concept, value);
    } else if (
      formElement.concept.datatype === Concept.dataType.Date &&
      !isNil(formElement.durationOptions)
    ) {
      observationHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
    } else {
      observationHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
    }
    return observationHolder.observations;
  },

  validate(formElement, value, observations, validationResults, formElementStatuses) {
    let isNullForMultiselect = false;
    if (formElement.concept.datatype === Concept.dataType.Coded && formElement.isMultiSelect()) {
      const observationHolder = new ObservationsHolder(observations);
      const answers =
        observationHolder.findObservation(formElement.concept) &&
        observationHolder.findObservation(formElement.concept).getValue();

      isNullForMultiselect = isNil(answers);
    }

    const validationResult = formElement.validate(isNullForMultiselect ? null : value);

    remove(
      validationResults,
      existingValidationResult =>
        existingValidationResult.formIdentifier === validationResult.formIdentifier
    );

    validationResults.push(validationResult);
    const ruleValidationErrors = getRuleValidationErrors(formElementStatuses);
    const hiddenFormElementStatus = filter(formElementStatuses, form => form.visibility === false);
    const ruleErrorsAdded = addPreviousValidationErrors(
      ruleValidationErrors,
      validationResult,
      validationResults
    );
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
