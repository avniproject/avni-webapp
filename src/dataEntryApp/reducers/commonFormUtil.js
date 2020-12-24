import { filter, find, isEmpty, isNil, sortBy, unionBy, remove, findIndex } from "lodash";
import {
  filterFormElements,
  getFormElementStatuses
} from "dataEntryApp/services/FormElementService";
import {
  FormElementGroup,
  ObservationsHolder,
  StaticFormElementGroup,
  ValidationResult
} from "openchs-models";
import { getFormElementsStatuses } from "dataEntryApp/services/RuleEvaluationService";
import Wizard from "dataEntryApp/state/Wizard";
import formElementService from "dataEntryApp/services/FormElementService";

const filterFormElementsWithStatus = (formElementGroup, entity) => {
  let formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  return {
    filteredFormElements: formElementGroup.filterElements(formElementStatuses),
    formElementStatuses
  };
};

const onLoad = (form, entity, defaultWizard = null) => {
  const firstGroupWithAtLeastOneVisibleElement = find(
    sortBy(form.nonVoidedFormElementGroups(), "displayOrder"),
    formElementGroup => filterFormElements(formElementGroup, entity).length !== 0
  );
  if (isNil(firstGroupWithAtLeastOneVisibleElement)) {
    return {
      formElementGroup: new StaticFormElementGroup(form),
      filteredFormElements: [],
      onSummaryPage: false,
      wizard: new Wizard(1),
      isFormEmpty: true
    };
  }
  const filteredFormElements = filterFormElements(firstGroupWithAtLeastOneVisibleElement, entity);
  const indexOfGroup =
    findIndex(
      form.getFormElementGroups(),
      feg => feg.uuid === firstGroupWithAtLeastOneVisibleElement.uuid
    ) + 1;
  return {
    filteredFormElements,
    formElementGroup: firstGroupWithAtLeastOneVisibleElement,
    // wizard: defaultWizard ? defaultWizard : new Wizard(form.numberOfPages, indexOfGroup, indexOfGroup),
    wizard: new Wizard(form.numberOfPages, indexOfGroup, indexOfGroup)
  };
};

function nextState(
  formElementGroup,
  filteredFormElements,
  validationResults,
  observations,
  entity,
  onSummaryPage,
  wizard
) {
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

const onNext = ({
  formElementGroup,
  observations,
  entity,
  filteredFormElements,
  validationResults,
  wizard,
  entityValidations
}) => {
  const obsHolder = new ObservationsHolder(observations);
  const formElementGroupValidations = new FormElementGroup().validate(
    obsHolder,
    filterFormElements(formElementGroup, entity)
  );

  const allRuleValidationResults = unionBy(
    errors(formElementGroupValidations),
    errors(validationResults),
    errors(entityValidations),
    "formIdentifier"
  );
  const thereAreValidationErrors = !isEmpty(allRuleValidationResults);

  if (thereAreValidationErrors)
    return nextState(
      formElementGroup,
      filteredFormElements,
      allRuleValidationResults,
      observations,
      entity,
      false,
      wizard
    );

  const nextGroup = formElementGroup.next();

  if (isEmpty(nextGroup)) {
    const onSummaryPage = true;
    return nextState(
      formElementGroup,
      filteredFormElements,
      [],
      observations,
      entity,
      onSummaryPage,
      wizard
    );
  }
  const { filteredFormElements: nextFilteredFormElements } = !isEmpty(nextGroup)
    ? filterFormElementsWithStatus(nextGroup, entity)
    : { filteredFormElements: null };

  wizard.moveNext();
  if (isEmpty(nextFilteredFormElements)) {
    obsHolder.removeNonApplicableObs(nextGroup.getFormElements(), []);
    return onNext(nextState(nextGroup, [], [], obsHolder.observations, entity, false, wizard));
  } else {
    return nextState(
      nextGroup,
      nextFilteredFormElements,
      [],
      obsHolder.observations,
      entity,
      false,
      wizard
    );
  }
};

const onPrevious = ({
  formElementGroup,
  observations,
  entity,
  filteredFormElements,
  validationResults,
  onSummaryPage,
  wizard
}) => {
  const previousGroup = !onSummaryPage ? formElementGroup.previous() : formElementGroup;
  const { filteredFormElements: previousFilteredFormElements, formElementStatuses } = !isEmpty(
    previousGroup
  )
    ? filterFormElementsWithStatus(previousGroup, entity)
    : { filteredFormElements: null };

  if (!onSummaryPage) wizard.movePrevious();
  const obsHolder = new ObservationsHolder(observations);
  if (isEmpty(previousFilteredFormElements)) {
    obsHolder.removeNonApplicableObs(previousGroup.getFormElements(), previousFilteredFormElements);
    obsHolder.updatePrimitiveObs(previousFilteredFormElements, formElementStatuses);
    return onPrevious(
      nextState(
        previousGroup,
        previousFilteredFormElements,
        validationResults,
        obsHolder.observations,
        entity,
        false,
        wizard
      )
    );
  } else {
    return nextState(
      previousGroup,
      previousFilteredFormElements,
      validationResults,
      observations,
      entity,
      false,
      wizard
    );
  }
};

const handleValidationResult = (newValidationResults, existingValidationResults) => {
  const existingValidationResultClones = existingValidationResults.map(e =>
    ValidationResult.clone(e)
  );

  newValidationResults.forEach(newValidationResult => {
    remove(
      existingValidationResultClones,
      existingValidationResult =>
        existingValidationResult.formIdentifier === newValidationResult.formIdentifier
    );
    if (!newValidationResult.success) {
      existingValidationResultClones.push(newValidationResult);
    }
  });
  return existingValidationResultClones;
};

const updateObservations = (
  formElement,
  value,
  entity,
  observationsHolder,
  existingValidationResults
) => {
  const obsValue = formElementService.updateObservations(observationsHolder, formElement, value);
  const formElementStatuses = getFormElementStatuses(
    entity,
    formElement.formElementGroup,
    observationsHolder
  );
  const filteredFormElements = FormElementGroup._sortedFormElements(
    formElement.formElementGroup.filterElements(formElementStatuses)
  );
  observationsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);

  const validationResults = formElementService.validate(
    formElement,
    obsValue,
    observationsHolder.observations,
    existingValidationResults,
    formElementStatuses
  );
  return { filteredFormElements, validationResults };
};

export default {
  onLoad,
  onNext,
  onPrevious,
  handleValidationResult,
  updateObservations
};
