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
    return { formElementGroup: new StaticFormElementGroup(form), filteredFormElements: [] };
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
  entity
) {
  return {
    formElementGroup,
    filteredFormElements,
    validationResults,
    observations,
    entity
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

  if (!isEmpty(allRuleValidationResults))
    return nextState(
      formElementGroup,
      filteredFormElements,
      allRuleValidationResults,
      observations,
      entity
    );

  const nextGroup = formElementGroup.next();
  const { filteredFormElements: nextFilteredFormElements } = !isEmpty(nextGroup)
    ? filterFormElementsWithStatus(nextGroup, entity)
    : { filteredFormElements: null };

  if (!isEmpty(nextGroup) && isEmpty(nextFilteredFormElements)) {
    obsHolder.removeNonApplicableObs(nextGroup.getFormElements(), []);
    return onNext(nextState(nextGroup, [], [], obsHolder.observations, entity));
  } else {
    return nextState(nextGroup, nextFilteredFormElements, [], obsHolder.observations, entity);
  }
};

const onPrevious = ({ formElementGroup, validationResults, observations, entity }) => {
  const obsHolder = new ObservationsHolder(observations);
  const previousGroup = formElementGroup.previous();
  const { filteredFormElements, formElementStatuses } = !isEmpty(previousGroup)
    ? filterFormElementsWithStatus(previousGroup, entity)
    : { filteredFormElements: null };

  if (!isEmpty(previousGroup) && isEmpty(filteredFormElements)) {
    obsHolder.removeNonApplicableObs(previousGroup.getFormElements(), filteredFormElements);
    obsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
    return onPrevious(
      nextState(
        previousGroup,
        filteredFormElements,
        validationResults,
        obsHolder.observations,
        entity
      )
    );
  } else {
    return nextState(
      previousGroup,
      filteredFormElements,
      validationResults,
      obsHolder.observations,
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
