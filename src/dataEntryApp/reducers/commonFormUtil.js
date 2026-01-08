import _, { filter, find, findIndex, get, intersectionBy, isEmpty, isNil, remove, some, sortBy, union, unionBy } from "lodash";
import formElementService, {
  filterFormElements,
  filterFormElementStatusesAndConvertToValidationResults,
  getFormElementStatuses,
} from "dataEntryApp/services/FormElementService";
import { Concept, ObservationsHolder, StaticFormElementGroup, ValidationResult } from "openchs-models";
import { getFormElementsStatuses } from "dataEntryApp/services/RuleEvaluationService";
import Wizard from "dataEntryApp/state/Wizard";
import WebFormElementGroup from "../../common/model/WebFormElementGroup";

const filterFormElementsWithStatus = (formElementGroup, entity) => {
  let formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  return {
    filteredFormElements: formElementGroup.filterElements(formElementStatuses),
    formElementStatuses,
  };
};

const fetchFilteredFormElementsAndUpdateEntityObservations = (formElementGroup, entity) => {
  const obsHolder = new ObservationsHolder(entity.observations);
  const { filteredFormElements, formElementStatuses } = getFormElementStatuses(entity, formElementGroup, obsHolder);
  obsHolder.updatePrimitiveCodedObs(filteredFormElements, formElementStatuses);
  if (hasQuestionGroupWithValueInElementStatus(formElementStatuses, formElementGroup.getFormElements())) {
    const { filteredFormElements: filteredFormElementsLatest } = getFormElementStatuses(entity, formElementGroup, obsHolder);
    return filteredFormElementsLatest;
  }
  return filteredFormElements;
};

const getUpdatedNextFilteredFormElements = (formElementStatuses, nextGroup, entity, nextFilteredFormElements) => {
  if (hasQuestionGroupWithValueInElementStatus(formElementStatuses, nextGroup.getFormElements())) {
    let { filteredFormElements: updatedNextFilteredFormElements } = filterFormElementsWithStatus(nextGroup, entity);
    return updatedNextFilteredFormElements;
  }
  return nextFilteredFormElements;
};

// We need to re-fetch the statuses to make sure any hidden form element due to empty values shows up this time.
const hasQuestionGroupWithValueInElementStatus = (formElementStatuses, allFormElements) => {
  const checkFormElement = ({ uuid, value }) => {
    if (value) {
      return (
        _.get(
          _.find(allFormElements, (fe) => fe.uuid === uuid),
          "concept.datatype",
        ) === Concept.dataType.QuestionGroup
      );
    }
    return false;
  };

  return _.some(formElementStatuses, checkFormElement);
};

const onLoad = (form, entity, isIndividualRegistration = false, isEdit = false, isImmutable = false) => {
  const firstGroupWithAtLeastOneVisibleElement = find(
    sortBy(form.nonVoidedFormElementGroups(), "displayOrder"),
    (formElementGroup) => filterFormElements(formElementGroup, entity).length !== 0,
  );

  const lastGroupWithAtLeastOneVisibleElement = find(
    sortBy(form.nonVoidedFormElementGroups(), "displayOrder").reverse(),
    (formElementGroup) => filterFormElements(formElementGroup, entity).length !== 0,
  );

  function isObsPresent(formElement) {
    return find(entity.observations, (observation) => {
      return observation.concept.uuid === formElement.concept.uuid;
    });
  }

  let formElementGroupWithoutObs = find(sortBy(form.nonVoidedFormElementGroups(), "displayOrder"), (formElementGroup) => {
    let obsArr = [];
    const filteredFormElements = filterFormElements(formElementGroup, entity);
    if (!!filteredFormElements && filteredFormElements.length === 0) {
      return false;
    }
    filteredFormElements.forEach((formElement) => {
      return isObsPresent(formElement) ? obsArr.push(formElement) : "";
    });
    return obsArr.length === 0;
  });

  if (isNil(firstGroupWithAtLeastOneVisibleElement)) {
    const staticFEG = new StaticFormElementGroup(form);
    return {
      formElementGroup: staticFEG,
      filteredFormElements: [],
      onSummaryPage: false,
      wizard: new Wizard(1),
      isFormEmpty: true,
    };
  }

  const getReturnObject = (formElementGroup, entity, isSummaryPage = false) => {
    const indexOfGroup = findIndex(form.getFormElementGroups(), (feg) => feg.uuid === formElementGroup.uuid) + 1;
    const filteredFormElements = fetchFilteredFormElementsAndUpdateEntityObservations(formElementGroup, entity);
    return {
      filteredFormElements: filteredFormElements,
      formElementGroup: formElementGroup,
      wizard: new Wizard(form.numberOfPages, indexOfGroup, indexOfGroup),
      onSummaryPage: isSummaryPage,
    };
  };
  const formElementGroup = isImmutable ? formElementGroupWithoutObs : firstGroupWithAtLeastOneVisibleElement;

  if (!formElementGroup) {
    return getReturnObject(lastGroupWithAtLeastOneVisibleElement, entity, true);
  }

  return getReturnObject(formElementGroup, entity);
};

function nextState(formElementGroup, filteredFormElements, validationResults, observations, entity, onSummaryPage, wizard) {
  return {
    formElementGroup,
    filteredFormElements,
    validationResults,
    observations,
    entity,
    onSummaryPage,
    wizard,
  };
}

const isFailedValidation = (result) => !result.success;
const errors = (validationResults) => filter(validationResults, isFailedValidation);

const getIdValidationErrors = (filteredFormElements, obsHolder) => {
  const isIdFieldWithoutObservation = (fe) => fe.getType() === Concept.dataType.Id && isNil(obsHolder.findObservation(fe.concept));
  const createValidationResult = (fe) => ValidationResult.failure(fe.uuid, "ranOutOfIds");

  return filter(filteredFormElements, isIdFieldWithoutObservation).map(createValidationResult);
};

// Utility functions for form element validation
const getStandaloneElements = (formElements) => filter(formElements, (fe) => !isNil(fe) && !isNil(fe.concept) && isNil(fe.group));

const getQuestionGroupElements = (formElements) =>
  filter(formElements, (fe) => !isNil(fe) && !isNil(fe.concept) && fe.concept.datatype === Concept.dataType.QuestionGroup);

const getChildFormElements = (formElements) => filter(formElements, (fe) => !isNil(fe) && !isNil(fe.concept) && !isNil(fe.group));

/**
 * Validates a single form element
 * @param {Object} params - Parameters for validation
 * @returns {Array} Validation results
 */
const validateElement = ({
  formElement,
  parentElement = null,
  groupObservation = null,
  obsHolder,
  formElementStatuses,
  validationResults,
}) => {
  if (isNil(formElement) || isNil(formElement.concept)) {
    return validationResults;
  }

  const obsValue = groupObservation ? groupObservation.getObservation(formElement.concept) : obsHolder.findObservation(formElement.concept);

  const targetElement = parentElement || formElement;
  const childElement = parentElement ? formElement : null;

  const results = formElementService.validateForMandatoryFieldIsEmptyOrNullOnly(
    targetElement,
    obsValue,
    obsHolder.observations,
    [],
    formElementStatuses,
    childElement,
  );

  return [...validationResults, ...results];
};

/**
 * Validates a repeatable question group
 * @param {Object} params - Parameters for validation
 * @returns {Array} Validation results
 */
const validateRepeatableQuestionGroup = ({
  formElement,
  questionGroupWrapper,
  formElements,
  obsHolder,
  formElementStatuses,
  validationResults,
}) => {
  let results = [...validationResults];

  // Get the number of groups
  const groupCount = questionGroupWrapper.size();

  // Check if groupCount is valid
  if (isNil(groupCount) || groupCount <= 0) {
    return results;
  }

  // Validate each group in the repeatable question group
  for (let i = 0; i < groupCount; i++) {
    const groupObservation = questionGroupWrapper.getGroupObservationAtIndex(i);

    // Check if groupObservation is null
    if (isNil(groupObservation)) {
      continue;
    }

    // Find child form elements for this group
    const childFormElements = filter(
      formElements,
      (ffe) =>
        !isNil(ffe) && !isNil(ffe.concept) && get(ffe, "group.uuid") === formElement.uuid && !ffe.voided && ffe.questionGroupIndex === i,
    );

    // Validate each child form element
    const validationParams = {
      parentElement: formElement,
      groupObservation,
      obsHolder,
      formElementStatuses,
      validationResults: results,
    };
    for (let j = 0; j < childFormElements.length; j++) {
      const childElement = childFormElements[j];
      results = validateElement({
        ...validationParams,
        formElement: childElement,
      });
    }
  }

  return results;
};

/**
 * Validates a non-repeatable question group
 * @param {Object} params - Parameters for validation
 * @returns {Array} Validation results
 */
const validateNonRepeatableQuestionGroup = ({
  formElement,
  questionGroupWrapper,
  formElements,
  obsHolder,
  formElementStatuses,
  validationResults,
}) => {
  let results = [...validationResults];

  // Find child form elements
  const childFormElements = filter(
    formElements,
    (ffe) => !isNil(ffe) && !isNil(ffe.group) && get(ffe, "group.uuid") === formElement.uuid && !ffe.voided,
  );

  // Validate each child form element
  const validationParams = {
    parentElement: formElement,
    groupObservation: questionGroupWrapper,
    obsHolder,
    formElementStatuses,
    validationResults: results,
  };

  for (let i = 0; i < childFormElements.length; i++) {
    const childElement = childFormElements[i];
    results = validateElement({
      ...validationParams,
      formElement: childElement,
    });
  }

  return results;
};

/**
 * Validates a child element in a repeatable group
 * @param {Object} params - Parameters for validation
 * @returns {Array} Validation results
 */
const validateChildInRepeatableGroup = ({ childFormElement, obsHolder, formElementStatuses, validationResults }) => {
  let results = [...validationResults];

  const indexProcessed = some(
    results,
    (vr) => vr.formIdentifier === childFormElement.uuid && vr.questionGroupIndex === childFormElement.questionGroupIndex,
  );

  // If this specific index wasn't processed, validate it
  if (!indexProcessed) {
    const parentFormElement = childFormElement.group;
    const obsValue = obsHolder.findObservation(parentFormElement.concept);

    // If there's no observation for the parent, validate with empty value
    if (isNil(obsValue)) {
      return validateElement({
        formElement: childFormElement,
        parentElement: parentFormElement,
        obsHolder,
        formElementStatuses,
        validationResults: results,
      });
    }

    // If there is an observation, try to get the specific group
    const questionGroupWrapper = obsValue.getValueWrapper();
    if (!isNil(questionGroupWrapper)) {
      const groupObservation = questionGroupWrapper.getGroupObservationAtIndex(childFormElement.questionGroupIndex);

      // If there's no observation for this specific index, validate with empty value
      if (isNil(groupObservation)) {
        return validateElement({
          formElement: childFormElement,
          parentElement: parentFormElement,
          obsHolder,
          formElementStatuses,
          validationResults: results,
        });
      }

      // If there is an observation for this index, validate with the actual value
      return validateElement({
        formElement: childFormElement,
        parentElement: parentFormElement,
        groupObservation,
        obsHolder,
        formElementStatuses,
        validationResults: results,
      });
    }
  }

  return results;
};

/**
 * Validates form elements and returns validation results
 * @param {Array} filteredFormElements - Form elements to validate
 * @param {Object} obsHolder - Observations holder
 * @returns {Array} Array of validation results
 */
const getFEDataValidationErrors = (filteredFormElements, obsHolder) => {
  // Early return if no form elements to validate
  if (isNil(filteredFormElements) || isEmpty(filteredFormElements)) {
    return [];
  }

  let validationResults = [];
  const formElementStatuses = [];

  // Process standalone form elements
  const standaloneElements = getStandaloneElements(filteredFormElements);
  standaloneElements.forEach((element) => {
    validationResults = validateElement({
      formElement: element,
      obsHolder,
      formElementStatuses,
      validationResults,
    });
  });

  // Process question groups
  const questionGroups = getQuestionGroupElements(filteredFormElements);
  questionGroups.forEach((formElement) => {
    const obsValue = obsHolder.findObservation(formElement.concept);

    // If observation doesn't exist, validate the empty value
    if (isNil(obsValue)) {
      validationResults = validateElement({
        formElement,
        obsHolder,
        formElementStatuses,
        validationResults,
      });
      return;
    }

    // Get the question group wrapper
    const questionGroupWrapper = obsValue.getValueWrapper();

    // Check if questionGroupWrapper is null
    if (isNil(questionGroupWrapper)) {
      return;
    }

    // Handle repeatable vs non-repeatable groups differently
    if (formElement.repeatable) {
      validationResults = validateRepeatableQuestionGroup({
        formElement,
        questionGroupWrapper,
        formElements: filteredFormElements,
        obsHolder,
        formElementStatuses,
        validationResults,
      });
    } else {
      validationResults = validateNonRepeatableQuestionGroup({
        formElement,
        questionGroupWrapper,
        formElements: filteredFormElements,
        obsHolder,
        formElementStatuses,
        validationResults,
      });
    }
  });

  // Process remaining child elements that might not have been processed
  const childElements = getChildFormElements(filteredFormElements);
  childElements.forEach((childFormElement) => {
    // Skip if already processed through parent
    const alreadyProcessed = some(validationResults, (vr) => vr.formIdentifier === childFormElement.uuid);

    // For repeatable question groups, also check if the specific questionGroupIndex was processed
    const isInRepeatableGroup = !isNil(childFormElement.group) && childFormElement.group.repeatable;
    const hasQuestionGroupIndex = !isNil(childFormElement.questionGroupIndex);

    // If this is a child of a repeatable group with an index, check if that specific index was processed
    if (isInRepeatableGroup && hasQuestionGroupIndex && !alreadyProcessed) {
      validationResults = validateChildInRepeatableGroup({
        childFormElement,
        obsHolder,
        formElementStatuses,
        validationResults,
      });
    }
    // For non-repeatable groups or if not already processed
    else if (!alreadyProcessed) {
      validationResults = validateElement({
        formElement: childFormElement,
        obsHolder,
        formElementStatuses,
        validationResults,
      });
    }
  });

  return validationResults;
};

const onNext = ({
  formElementGroup,
  observations,
  entity,
  filteredFormElements,
  validationResults,
  wizard,
  entityValidations,
  staticFormElementIds,
}) => {
  const obsHolder = new ObservationsHolder(observations);

  // Get rule validation errors first - these determine which form elements are visible
  const ruleValidationErrors = filterFormElementStatusesAndConvertToValidationResults(formElementGroup, entity);
  const formElementGroupValidations = new WebFormElementGroup().validate(obsHolder, filterFormElements(formElementGroup, entity));

  // Get validation errors
  const idValidationErrors = getIdValidationErrors(filteredFormElements, obsHolder);
  const dataValidationErrors = getFEDataValidationErrors(filteredFormElements, obsHolder);

  // Filter validation errors using intersectionBy to only include those that match form elements in ruleValidationErrors
  const filteredIdValidationErrors = intersectionBy(idValidationErrors, ruleValidationErrors, "formIdentifier");
  const filteredDataValidationErrors = intersectionBy(dataValidationErrors, ruleValidationErrors, "formIdentifier");
  const filteredValidationResults = intersectionBy(validationResults || [], ruleValidationErrors, "formIdentifier");
  const filteredEntityValidations = intersectionBy(entityValidations || [], ruleValidationErrors, "formIdentifier");

  // Combine all validation results using unionBy
  const allRuleValidationResults = unionBy(
    errors(idValidationErrors),
    errors(formElementGroupValidations),
    errors(ruleValidationErrors),
    errors(filteredIdValidationErrors),
    errors(filteredDataValidationErrors),
    errors(filteredValidationResults),
    errors(filteredEntityValidations),
    "formIdentifier",
  );

  const anyFailedResultForCurrentFEG = () => {
    const formUUIDs = union(formElementGroup.formElementIds, staticFormElementIds);
    return some(allRuleValidationResults, (validationResult) => {
      return validationResult.success === false && formUUIDs.indexOf(validationResult.formIdentifier) !== -1;
    });
  };

  const thereAreValidationErrors = anyFailedResultForCurrentFEG();

  if (thereAreValidationErrors)
    return nextState(formElementGroup, filteredFormElements, allRuleValidationResults, observations, entity, false, wizard);

  const nextGroup = formElementGroup.next();

  if (isEmpty(nextGroup)) {
    const onSummaryPage = true;
    return nextState(formElementGroup, filteredFormElements, allRuleValidationResults, observations, entity, onSummaryPage, wizard);
  }
  const { filteredFormElements: nextFilteredFormElements, formElementStatuses } = !isEmpty(nextGroup)
    ? filterFormElementsWithStatus(nextGroup, entity)
    : { filteredFormElements: null };

  wizard.moveNext();
  if (isEmpty(nextFilteredFormElements)) {
    obsHolder.removeNonApplicableObs(nextGroup.getFormElements(), []);
    return onNext(nextState(nextGroup, [], allRuleValidationResults, obsHolder.observations, entity, false, wizard));
  } else {
    obsHolder.updatePrimitiveCodedObs(nextFilteredFormElements, formElementStatuses);
    const updatedNextFilteredFormElements = getUpdatedNextFilteredFormElements(
      formElementStatuses,
      nextGroup,
      entity,
      nextFilteredFormElements,
    );
    return nextState(nextGroup, updatedNextFilteredFormElements, allRuleValidationResults, obsHolder.observations, entity, false, wizard);
  }
};

const onPrevious = ({ formElementGroup, observations, entity, filteredFormElements, validationResults, onSummaryPage, wizard }) => {
  const previousGroup = !onSummaryPage ? formElementGroup.previous() : formElementGroup;

  if (isEmpty(previousGroup)) {
    return nextState(formElementGroup, filteredFormElements, validationResults, observations, entity, false, wizard);
  }

  const { filteredFormElements: previousFilteredFormElements, formElementStatuses } = !isEmpty(previousGroup)
    ? filterFormElementsWithStatus(previousGroup, entity)
    : { filteredFormElements: null };

  if (!onSummaryPage && previousGroup != null) wizard.movePrevious();
  const obsHolder = new ObservationsHolder(observations);
  if (isEmpty(previousFilteredFormElements)) {
    obsHolder.removeNonApplicableObs(previousGroup.getFormElements(), previousFilteredFormElements);
    obsHolder.updatePrimitiveCodedObs(previousFilteredFormElements, formElementStatuses);
    return onPrevious(
      nextState(previousGroup, previousFilteredFormElements, validationResults, obsHolder.observations, entity, false, wizard),
    );
  } else {
    return nextState(previousGroup, previousFilteredFormElements, validationResults, observations, entity, false, wizard);
  }
};

const handleValidationResult = (newValidationResults, existingValidationResults) => {
  const existingValidationResultClones = existingValidationResults.map((e) => ValidationResult.clone(e));

  newValidationResults.forEach((newValidationResult) => {
    remove(
      existingValidationResultClones,
      (existingValidationResult) => existingValidationResult.formIdentifier === newValidationResult.formIdentifier,
    );
    if (!newValidationResult.success) {
      existingValidationResultClones.push(newValidationResult);
    }
  });
  return existingValidationResultClones;
};

function postObservationsUpdate(entity, formElement, observationsHolder, obsValue, existingValidationResults, childFormElement) {
  let { formElementStatuses, filteredFormElements } = getFormElementStatuses(entity, formElement.formElementGroup, observationsHolder);
  observationsHolder.updatePrimitiveCodedObs(filteredFormElements, formElementStatuses);
  if (hasQuestionGroupWithValueInElementStatus(formElementStatuses, formElement.formElementGroup.getFormElements())) {
    const { filteredFormElements: filteredFormElementsLatest } = getFormElementStatuses(
      entity,
      formElement.formElementGroup,
      observationsHolder,
    );
    filteredFormElements = filteredFormElementsLatest;
  }

  const validationResults = formElementService.validate(
    formElement,
    obsValue,
    observationsHolder.observations,
    existingValidationResults,
    formElementStatuses,
    childFormElement,
  );
  return { filteredFormElements, validationResults };
}

const updateObservations = (
  formElement,
  value,
  entity,
  observationsHolder,
  existingValidationResults,
  childFormElement,
  questionGroupIndex,
) => {
  const obsValue = formElementService.updateObservations(observationsHolder, formElement, value, childFormElement, questionGroupIndex);
  const { filteredFormElements, validationResults } = postObservationsUpdate(
    entity,
    formElement,
    observationsHolder,
    obsValue,
    existingValidationResults,
    childFormElement,
  );
  return { filteredFormElements, validationResults };
};

function getRepeatableQuestionGroup(observations, concept) {
  const observationsHolder = new ObservationsHolder(observations);
  const observation = observationsHolder.findObservation(concept);
  return observation.getValueWrapper();
}

function addNewQuestionGroup(entity, formElement, observations) {
  const repeatableQuestionGroup = getRepeatableQuestionGroup(observations, formElement.concept);
  repeatableQuestionGroup.addQuestionGroup();
  return getFormElementStatuses(entity, formElement.formElementGroup, new ObservationsHolder(observations));
}

function removeQuestionGroup(entity, formElement, observations, existingValidationResults, index) {
  const repeatableQuestionGroup = getRepeatableQuestionGroup(observations, formElement.concept);

  // Remove validation results for the question group being removed
  let updatedValidationResults = existingValidationResults || [];
  if (existingValidationResults && existingValidationResults.length > 0) {
    // Create a function outside the filter loop
    const shouldKeepValidationResult = (validationResult) => {
      return !(
        validationResult.questionGroupIndex === index &&
        formElement.formElementGroup.getFormElements().some((fe) => fe.uuid === validationResult.formIdentifier)
      );
    };

    // Filter out validation results that belong to the question group being removed
    updatedValidationResults = existingValidationResults.filter(shouldKeepValidationResult);
  }

  // Remove the question group
  repeatableQuestionGroup.removeQuestionGroup(index);

  // Get updated form element statuses
  const { filteredFormElements } = getFormElementStatuses(entity, formElement.formElementGroup, new ObservationsHolder(observations));

  return {
    filteredFormElements,
    validationResults: updatedValidationResults,
  };
}

const getValidationResult = (validationResults, formElementIdentifier) =>
  find(validationResults, (validationResult) => validationResult.formIdentifier === formElementIdentifier);

export default {
  onLoad,
  onNext,
  onPrevious,
  handleValidationResult,
  updateObservations,
  getValidationResult,
  addNewQuestionGroup,
  removeQuestionGroup,
  getFEDataValidationErrors,
  getIdValidationErrors,
};
