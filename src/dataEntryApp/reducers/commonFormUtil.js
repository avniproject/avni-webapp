import { filter, find, isEmpty, isNil, sortBy, unionBy } from "lodash";
import { filterFormElements } from "dataEntryApp/services/FormElementService";
import {
  FormElementGroup,
  ObservationsHolder,
  StaticFormElementGroup,
  ValidationResults
} from "openchs-models";

export default {
  onLoad(form, entity) {
    const firstGroupWithAtLeastOneVisibleElement = find(
      sortBy(form.nonVoidedFormElementGroups(), "displayOrder"),
      formElementGroup => filterFormElements(formElementGroup, entity).length !== 0
    );
    if (isNil(firstGroupWithAtLeastOneVisibleElement)) {
      return new StaticFormElementGroup(form);
    }
    return firstGroupWithAtLeastOneVisibleElement;
  },

  onNext(state, obsHolder) {
    const formElementGroupValidations = new FormElementGroup().validate(
      obsHolder,
      filterFormElements(state.formElementGroup, entity)
    );
    const elementsWithValidationError = filter(
      formElementGroupValidations,
      ({ success }) => !success
    );
    const allRuleValidationResults = unionBy(
      elementsWithValidationError,
      state.validationResults,
      "formIdentifier"
    );

    return {
      ...state,
      validationResults: allRuleValidationResults
    };
    // const staticValidationResultsError =
    //   staticValidationResults &&
    //   new ValidationResults(staticValidationResults).hasValidationError();
    // setValidationResults(allRuleValidationResults);
    // if (
    //   new ValidationResults(allRuleValidationResults).hasValidationError() ||
    //   staticValidationResultsError
    // ) {
    //   event.preventDefault();
    //   return;
    // }
    // const nextGroup = formElementGroup.next();
    // const { filteredFormElements, formElementStatuses } = !isEmpty(nextGroup)
    //   ? filterFormElementsWithStatus(nextGroup, entity)
    //   : { filteredFormElements: null };
    // const nextPage = page + 1;
    // if (!isEmpty(nextGroup) && isEmpty(filteredFormElements)) {
    //   obsHolder.removeNonApplicableObs(nextGroup.getFormElements(), filteredFormElements);
    //   obsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
    //   handleNext(event, nextGroup, nextPage, skippedGroupCount + 1);
    // } else {
    //   setFilteredFormElements(filteredFormElements);
    //   let currentUrlParams = new URLSearchParams(history.location.search);
    //   currentUrlParams.set("page", (nextPage - skippedGroupCount).toString());
    //   history.push(history.location.pathname + "?" + currentUrlParams.toString());
    // }
  }
};
