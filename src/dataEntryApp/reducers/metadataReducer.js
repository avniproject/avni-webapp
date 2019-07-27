const prefix = "app/dataEntry/reducer/metadata/";

export const types = {
  SET_OPERATIONAL_MODULES: `${prefix}SET_OPERATIONAL_MODULES`,
  GET_OPERATIONAL_MODULES: `${prefix}GET_OPERATIONAL_MODULES`
};

export const setOperationalModules = operationalModules => ({
  type: types.SET_OPERATIONAL_MODULES,
  operationalModules
});

export const getOperationalModules = () => ({
  type: types.GET_OPERATIONAL_MODULES
});

const initialState = {
  operationalModules: {
    subjectTypes: [{ operationalSubjectTypeName: "" }],
    forms: []
  }
};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_OPERATIONAL_MODULES: {
      return {
        ...state,
        operationalModules: action.operationalModules
      };
    }
    default:
      return state;
  }
}
