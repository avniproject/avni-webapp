import { filter, find, isEmpty, isNil, sortBy, unionBy, remove } from "lodash";
import { filterFormElements } from "dataEntryApp/services/FormElementService";
import {
  FormElementGroup,
  ObservationsHolder,
  StaticFormElementGroup,
  ValidationResult
} from "openchs-models";
import { getFormElementsStatuses } from "dataEntryApp/services/RuleEvaluationService";

const filterFormElementsWithStatus = (formElementGroup, entity) => {
  let formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  return {
    filteredFormElements: formElementGroup.filterElements(formElementStatuses),
    formElementStatuses
  };
};

const onLoad = (form, entity) => {
  const firstGroupWithAtLeastOneVisibleElement = find(
    sortBy(form.nonVoidedFormElementGroups(), "displayOrder"),
    formElementGroup => filterFormElements(formElementGroup, entity).length !== 0
  );
  if (isNil(firstGroupWithAtLeastOneVisibleElement)) {
    return { formElementGroup: null, filteredFormElements: [], onSummaryPage: true };
  }
  const filteredFormElements = filterFormElements(firstGroupWithAtLeastOneVisibleElement, entity);
  return {
    filteredFormElements,
    formElementGroup: firstGroupWithAtLeastOneVisibleElement
  };
};

function nextState(
  formElementGroup,
  filteredFormElements,
  validationResults,
  observations,
  entity,
  onSummaryPage = false,
  renderStaticPage = false
) {
  return {
    formElementGroup,
    filteredFormElements,
    validationResults,
    observations,
    entity,
    onSummaryPage,
    renderStaticPage
  };
}

const errors = validationResults => filter(validationResults, result => !result.success);

const onNext = ({
  formElementGroup,
  observations,
  entity,
  filteredFormElements,
  validationResults
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
      entity
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
      onSummaryPage
    );
  }
  const { filteredFormElements: nextFilteredFormElements } = !isEmpty(nextGroup)
    ? filterFormElementsWithStatus(nextGroup, entity)
    : { filteredFormElements: null };

  if (isEmpty(nextFilteredFormElements)) {
    obsHolder.removeNonApplicableObs(nextGroup.getFormElements(), []);
    return onNext(nextState(nextGroup, [], [], obsHolder.observations, entity));
  } else {
    return nextState(nextGroup, nextFilteredFormElements, [], obsHolder.observations, entity);
  }
};

const onPrevious = ({
  formElementGroup,
  observations,
  entity,
  filteredFormElements,
  validationResults,
  onSummaryPage
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
      renderStaticPage
    );
  }

  const { filteredFormElements: previousFilteredFormElements, formElementStatuses } = !isEmpty(
    previousGroup
  )
    ? filterFormElementsWithStatus(previousGroup, entity)
    : { filteredFormElements: null };

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
        entity
      )
    );
  } else {
    return nextState(
      previousGroup,
      previousFilteredFormElements,
      validationResults,
      observations,
      entity
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
