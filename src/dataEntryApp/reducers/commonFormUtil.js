import { filter, find, isEmpty, isNil, sortBy, unionBy, remove, findIndex } from "lodash";
import { filterFormElements } from "dataEntryApp/services/FormElementService";
import {
  FormElementGroup,
  ObservationsHolder,
  StaticFormElementGroup,
  ValidationResult
} from "openchs-models";
import { getFormElementsStatuses } from "dataEntryApp/services/RuleEvaluationService";
import Wizard from "dataEntryApp/state/Wizard";

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
      formElementGroup: null,
      filteredFormElements: [],
      onSummaryPage: true,
      wizard: new Wizard(1)
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
  renderStaticPage,
  wizard
) {
  return {
    formElementGroup,
    filteredFormElements,
    validationResults,
    observations,
    entity,
    onSummaryPage,
    renderStaticPage,
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
  wizard
}) => {
  const obsHolder = new ObservationsHolder(observations);
  const formElementGroupValidations = new FormElementGroup().validate(
    obsHolder,
    filterFormElements(formElementGroup, entity)
  );

  const allRuleValidationResults = unionBy(
    errors(formElementGroupValidations),
    errors(validationResults),
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
      false,
      wizard
    );
  }
  const { filteredFormElements: nextFilteredFormElements } = !isEmpty(nextGroup)
    ? filterFormElementsWithStatus(nextGroup, entity)
    : { filteredFormElements: null };

  wizard.moveNext();
  if (isEmpty(nextFilteredFormElements)) {
    obsHolder.removeNonApplicableObs(nextGroup.getFormElements(), []);
    return onNext(
      nextState(nextGroup, [], [], obsHolder.observations, entity, false, false, wizard)
    );
  } else {
    return nextState(
      nextGroup,
      nextFilteredFormElements,
      [],
      obsHolder.observations,
      entity,
      false,
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

  if (isEmpty(previousGroup)) {
    const renderStaticPage = true;
    return nextState(
      formElementGroup,
      filteredFormElements,
      validationResults,
      observations,
      entity,
      false,
      renderStaticPage,
      wizard
    );
  }

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

export default {
  onLoad,
  onNext,
  onPrevious,
  handleValidationResult
};
