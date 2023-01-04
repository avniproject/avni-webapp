const prefix = "app/news/reducer/metadata/";

export const types = {
  SET_OPERATIONAL_MODULES: `${prefix}SET_OPERATIONAL_MODULES`,
  GET_OPERATIONAL_MODULES: `${prefix}GET_OPERATIONAL_MODULES`,
  GET_GENDERS: `${prefix}GET_GENDERS`,
  SET_GENDERS: `${prefix}SET_GENDERS`,
  GET_ORGANISATION_CONFIG: `${prefix}GET_ORGANISATION_CONFIG`,
  SET_ORGANISATION_CONFIG: `${prefix}SET_ORGANISATION_CONFIG`
};

export const getOperationalModules = () => ({
  type: types.GET_OPERATIONAL_MODULES
});

export const setOperationalModules = operationalModules => ({
  type: types.SET_OPERATIONAL_MODULES,
  operationalModules
});

export const getGenders = () => ({
  type: types.GET_GENDERS
});

export const setGenders = genders => ({
  type: types.SET_GENDERS,
  genders
});

export const getOrganisationConfig = () => ({
  type: types.GET_ORGANISATION_CONFIG
});

export const setOrganisationConfig = organisationConfig => ({
  type: types.SET_ORGANISATION_CONFIG,
  organisationConfig
});

export default function(state = {}, action) {
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
    case types.SET_ORGANISATION_CONFIG: {
      return {
        ...state,
        organisationConfig: action.organisationConfig
      };
    }
    default:
      return state;
  }
}
