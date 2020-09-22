const prefix = "app/dataEntry/reducer/rules/";

export const types = {
  SET_FILTERED_FORM_ELEMENTS: `${prefix}SET_FILTERED_FORM_ELEMENTS`
};

export const setFilteredFormElements = filteredFormElements => ({
  type: types.SET_FILTERED_FORM_ELEMENTS,
  filteredFormElements
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_FILTERED_FORM_ELEMENTS: {
      return {
        ...state,
        filteredFormElements: action.filteredFormElements
      };
    }
    default:
      return state;
  }
}
