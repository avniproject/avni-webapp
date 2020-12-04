import { filter, find, isEmpty, isNil, sortBy, unionBy } from "lodash";
import { filterFormElements } from "dataEntryApp/services/FormElementService";
import { FormElementGroup, ObservationsHolder, StaticFormElementGroup } from "openchs-models";
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

function nextState(nextGroup, filteredFormElements, allRuleValidationResults, obsHolder, entity) {
  return {
    formElementGroup: nextGroup,
    filteredFormElements: filteredFormElements,
    validationResults: allRuleValidationResults,
    observations: obsHolder.observations,
    entity
  };
}

const onNext = ({ formElementGroup, validationResults, observations, entity }) => {
  const obsHolder = new ObservationsHolder(observations);
  const formElementGroupValidations = new FormElementGroup().validate(
    obsHolder,
    filterFormElements(formElementGroup, entity)
  );
  const elementsWithValidationError = filter(
    formElementGroupValidations,
    ({ success }) => !success
  );
  const allRuleValidationResults = unionBy(
    elementsWithValidationError,
    validationResults,
    "formIdentifier"
  );

  const nextGroup = formElementGroup.next();
  const { filteredFormElements, formElementStatuses } = !isEmpty(nextGroup)
    ? filterFormElementsWithStatus(nextGroup, entity)
    : { filteredFormElements: null };

  if (!isEmpty(nextGroup) && isEmpty(filteredFormElements)) {
    obsHolder.removeNonApplicableObs(nextGroup.getFormElements(), []);
    return onNext(nextState(nextGroup, [], allRuleValidationResults, obsHolder, entity));
  } else {
    return nextState(nextGroup, filteredFormElements, allRuleValidationResults, obsHolder, entity);
  }
};

export default {
  onLoad,
  onNext
};
