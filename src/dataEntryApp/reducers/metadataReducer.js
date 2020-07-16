const prefix = "app/dataEntry/reducer/metadata/";

export const types = {
  SET_OPERATIONAL_MODULES: `${prefix}SET_OPERATIONAL_MODULES`,
  GET_OPERATIONAL_MODULES: `${prefix}GET_OPERATIONAL_MODULES`,
  GET_GENDERS: `${prefix}GET_GENDERS`,
  SET_GENDERS: `${prefix}SET_GENDERS`,
  GET_ALLLOCATION: `${prefix}GET_ALLLOCATION`,
  SET_ALLLOCATION: `${prefix}SET_ALLLOCATION`
};

export const setOperationalModules = operationalModules => ({
  type: types.SET_OPERATIONAL_MODULES,
  operationalModules
});

export const getOperationalModules = () => ({
  type: types.GET_OPERATIONAL_MODULES
});

export const getGenders = () => ({
  type: types.GET_GENDERS
});

export const setGenders = genders => ({
  type: types.SET_GENDERS,
  genders
});
export const getAllLocations = allLocations => ({
  type: types.GET_ALLLOCATION,
  allLocations
});

export const setAllLocations = allLocations => ({
  type: types.SET_ALLLOCATION,
  allLocations
});

const initialState = {};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_OPERATIONAL_MODULES: {
      return {
        ...state,
        operationalModules: action.operationalModules
      };
    }
    case types.SET_GENDERS: {
      return {
        ...state,
        genders: action.genders
      };
    }
    case types.SET_ALLLOCATION: {
      return {
        ...state,
        allLocations: action.allLocations
      };
    }
    default:
      return state;
  }
}
