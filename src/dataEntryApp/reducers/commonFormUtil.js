import { find, isNil, sortBy } from "lodash";
import { filterFormElements } from "dataEntryApp/services/FormElementService";
import { StaticFormElementGroup } from "openchs-models";

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
  }
};
