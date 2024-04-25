import _, { filter, find, findIndex, isEmpty, isNil, remove, sortBy, unionBy, some, union } from "lodash";
import formElementService, { filterFormElements, getFormElementStatuses } from "dataEntryApp/services/FormElementService";
import { Concept, ObservationsHolder, StaticFormElementGroup, ValidationResult } from "openchs-models";
import { getFormElementsStatuses } from "dataEntryApp/services/RuleEvaluationService";
import Wizard from "dataEntryApp/state/Wizard";
import WebFormElementGroup from "../../common/model/WebFormElementGroup";

const filterFormElementsWithStatus = (formElementGroup, entity) => {
  let formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  return {
    filteredFormElements: formElementGroup.filterElements(formElementStatuses),
    formElementStatuses
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
  return _.some(formElementStatuses, ({ uuid, value }) => {
    if (value) {
      return _.get(_.find(allFormElements, fe => fe.uuid === uuid), "concept.datatype") === Concept.dataType.QuestionGroup;
    }
  });
};

const onLoad = (form, entity, isIndividualRegistration = false, isEdit = false) => {
  const firstGroupWithAtLeastOneVisibleElement = find(
    sortBy(form.nonVoidedFormElementGroups(), "displayOrder"),
    formElementGroup => filterFormElements(formElementGroup, entity).length !== 0
  );

  const lastGroupWithAtLeastOneVisibleElement = find(
    sortBy(form.nonVoidedFormElementGroups(), "displayOrder").reverse(),
    formElementGroup => filterFormElements(formElementGroup, entity).length !== 0
  );

  function isObsPresent(formElement) {
    return find(entity.observations, observation => {
      return observation.concept.uuid === formElement.concept.uuid;
    });
  }

  let formElementGroupWithoutObs = find(sortBy(form.nonVoidedFormElementGroups(), "displayOrder"), formElementGroup => {
    let obsArr = [];
    const filteredFormElements = filterFormElements(formElementGroup, entity);
    if (!!filteredFormElements && filteredFormElements.length === 0) {
      return false;
    }
    filteredFormElements.forEach(formElement => {
      return isObsPresent(formElement) ? obsArr.push(formElement) : "";
    });
    return obsArr.length === 0;
  });

  if (isNil(firstGroupWithAtLeastOneVisibleElement)) {
    const staticFEG = new StaticFormElementGroup(form);
    const nextFEG = staticFEG.next();
    return {
      //for the individual subject types first group is displayed with static group so moving it to next group.
      formElementGroup: isIndividualRegistration && nextFEG ? nextFEG : staticFEG,
      filteredFormElements: [],
      onSummaryPage: false,
      wizard: new Wizard(1),
      isFormEmpty: true
    };
  }

  const getReturnObject = (formElementGroup, entity, isSummaryPage = false) => {
    const indexOfGroup = findIndex(form.getFormElementGroups(), feg => feg.uuid === formElementGroup.uuid) + 1;
    const filteredFormElements = fetchFilteredFormElementsAndUpdateEntityObservations(formElementGroup, entity);
    return {
      filteredFormElements: filteredFormElements,
      formElementGroup: formElementGroup,
      wizard: new Wizard(form.numberOfPages, indexOfGroup, indexOfGroup),
      onSummaryPage: isSummaryPage
    };
  };
  const formElementGroup = isEdit ? firstGroupWithAtLeastOneVisibleElement : formElementGroupWithoutObs;

  if (!!!formElementGroup) {
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
    wizard
  };
}

const errors = validationResults => filter(validationResults, result => !result.success);

const getIdValidationErrors = (filteredFormElements, obsHolder) => {
  return filter(filteredFormElements, fe => fe.getType() === Concept.dataType.Id && isNil(obsHolder.findObservation(fe.concept))).map(fe =>
    ValidationResult.failure(fe.uuid, "ranOutOfIds")
  );
};

const onNext = ({
  formElementGroup,
  observations,
  entity,
  filteredFormElements,
  validationResults,
  wizard,
  entityValidations,
  staticFormElementIds
}) => {
  const obsHolder = new ObservationsHolder(observations);

  const idValidationErrors = getIdValidationErrors(filteredFormElements, obsHolder);

  const formElementGroupValidations = new WebFormElementGroup().validate(obsHolder, filterFormElements(formElementGroup, entity));

  const allRuleValidationResults = unionBy(
    errors(idValidationErrors),
    errors(formElementGroupValidations),
    errors(validationResults),
    errors(entityValidations),
    "formIdentifier"
  );

  const anyFailedResultForCurrentFEG = () => {
    const formUUIDs = union(formElementGroup.formElementIds, staticFormElementIds);
    return some(allRuleValidationResults, validationResult => {
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
      nextFilteredFormElements
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
      nextState(previousGroup, previousFilteredFormElements, validationResults, obsHolder.observations, entity, false, wizard)
    );
  } else {
    return nextState(previousGroup, previousFilteredFormElements, validationResults, observations, entity, false, wizard);
  }
};

const handleValidationResult = (newValidationResults, existingValidationResults) => {
  const existingValidationResultClones = existingValidationResults.map(e => ValidationResult.clone(e));

  newValidationResults.forEach(newValidationResult => {
    remove(
      existingValidationResultClones,
      existingValidationResult => existingValidationResult.formIdentifier === newValidationResult.formIdentifier
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
      observationsHolder
    );
    filteredFormElements = filteredFormElementsLatest;
  }

  const validationResults = formElementService.validate(
    formElement,
    obsValue,
    observationsHolder.observations,
    existingValidationResults,
    formElementStatuses,
    childFormElement
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
  questionGroupIndex
) => {
  const obsValue = formElementService.updateObservations(observationsHolder, formElement, value, childFormElement, questionGroupIndex);
  const { filteredFormElements, validationResults } = postObservationsUpdate(
    entity,
    formElement,
    observationsHolder,
    obsValue,
    existingValidationResults,
    childFormElement
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

function removeQuestionGroup(entity, formElement, observations, index) {
  const repeatableQuestionGroup = getRepeatableQuestionGroup(observations, formElement.concept);
  repeatableQuestionGroup.removeQuestionGroup(index);
  return getFormElementStatuses(entity, formElement.formElementGroup, new ObservationsHolder(observations));
}

const getValidationResult = (validationResults, formElementIdentifier) =>
  find(validationResults, validationResult => validationResult.formIdentifier === formElementIdentifier);

export default {
  onLoad,
  onNext,
  onPrevious,
  handleValidationResult,
  updateObservations,
  getValidationResult,
  addNewQuestionGroup,
  removeQuestionGroup
};
