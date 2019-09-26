const prefix = "app/translations/reducer/onLoad/";

export const types = {
  SET_ORG_CONFIG: `${prefix}SET_ORG_CONFIG`,
  GET_ORG_CONFIG: `${prefix}GET_ORG_CONFIG`
};

export const setOrgConfig = organisationConfig => ({
  type: types.SET_ORG_CONFIG,
  organisationConfig
});

export const getOrgConfig = () => ({
  type: types.GET_ORG_CONFIG
});

const initialState = {};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_ORG_CONFIG: {
      return {
        ...state,
        organisationConfig: action.organisationConfig
      };
    }
    default:
      return state;
  }
}
