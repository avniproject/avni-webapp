import { Concept, FormElementGroup, ValidationResult, QuestionGroup } from "avni-models";
import { differenceWith, some, filter, flatMap, head, isEmpty, isNil, map, remove } from "lodash";
import { getFormElementsStatuses } from "./RuleEvaluationService";

export default {
  updateObservations(observationsHolder, formElement, value, childFormElement, questionGroupIndex) {
    if (!isNil(childFormElement) && !isNil(childFormElement.groupUuid)) {
      if (formElement.repeatable) {
        observationsHolder.updateRepeatableGroupQuestion(
          questionGroupIndex,
          formElement,
          childFormElement,
          value
        );
      } else {
        observationsHolder.updateGroupQuestion(formElement, childFormElement, value);
      }
      const questionGroupTypeObservation = observationsHolder.findQuestionGroupObservation(
        formElement.concept,
        formElement,
        questionGroupIndex
      );
      let questionGroup;
      if (questionGroupTypeObservation) {
        questionGroup = questionGroupTypeObservation.getValueWrapper();
      } else {
        questionGroup = new QuestionGroup();
      }
      const childObs = questionGroup.findObservation(childFormElement.concept);
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
        formElement.concept.datatype === Concept.dataType.Video)
    ) {
      const observation = observationsHolder.toggleMultiSelectAnswer(formElement.concept, value);
      return observation && observation.getValueWrapper();
    } else if (
      formElement.isSingleSelect() &&
      (formElement.concept.datatype === Concept.dataType.Coded ||
        formElement.concept.datatype === Concept.dataType.Subject ||
        formElement.concept.datatype === Concept.dataType.Image ||
        formElement.concept.datatype === Concept.dataType.Video)
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
    } else if (formElement.concept.datatype === Concept.dataType.PhoneNumber) {
      const { phoneNumber, isVerified } = value;
      observationsHolder.updatePhoneNumberValue(formElement.concept, phoneNumber, isVerified);
      return phoneNumber;
    } else if (formElement.concept.datatype === Concept.dataType.File) {
      //TODO Handle File same as Image or Video later when its fixed in MediaUploader as well
      const observation = observationsHolder.toggleSingleSelectAnswer(formElement.concept, value);
      return observation && observation.getValueWrapper();
    } else {
      observationsHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
      return value;
    }
  },

  validate(
    formElement,
    value,
    observations,
    validationResults,
    formElementStatuses,
    childFormElement
  ) {
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
    const isChildFormElement =
      !isNil(childFormElement) && childFormElement.groupUuid === formElement.uuid;
    remove(
      ruleErrorsAdded,
      result =>
        result.success || (isChildFormElement && result.formIdentifier === childFormElement.uuid)
    );
    return differenceWith(
      ruleErrorsAdded,
      hiddenFormElementStatus,
      (a, b) => a.formIdentifier === b.uuid
    );
  }
};

export function getFormElementStatuses(entity, formElementGroup, observationsHolder) {
  const formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  const filteredFormElements = formElementGroup.filterElements(formElementStatuses);
  const sortedFilteredFormElements = FormElementGroup._sortedFormElements(filteredFormElements);
  const allFormElements = formElementGroup.getFormElements();
  const removedObs = observationsHolder.removeNonApplicableObs(
    allFormElements,
    sortedFilteredFormElements
  );
  if (isEmpty(removedObs)) {
    return formElementStatuses;
  }
  return getFormElementStatuses(entity, formElementGroup, observationsHolder);
}

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

export function nestedFormElements(formElements) {
  const nested = [];
  formElements.forEach(x => {
    if (isNil(x.group)) nested.push(x);
    else if (!some(nested, y => y.uuid === x.group.uuid)) nested.push(x.group);
  });
  return nested;
}
