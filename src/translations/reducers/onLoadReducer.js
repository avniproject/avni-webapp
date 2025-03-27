const prefix = "app/translations/reducer/onLoad/";

export const types = {
  SET_ORG_CONFIG: `${prefix}SET_ORG_CONFIG`,
  GET_ORG_CONFIG: `${prefix}GET_ORG_CONFIG`,
  GET_DASHBOARD_DATA: `${prefix}GET_DASHBOARD_DATA`,
  SET_DASHBOARD_DATA: `${prefix}SET_DASHBOARD_DATA`
};

export const setOrgConfig = organisationConfig => ({
  type: types.SET_ORG_CONFIG,
  organisationConfig
});

export const getOrgConfig = () => ({
  type: types.GET_ORG_CONFIG
});

export const getDashboardData = (platform, emptyValue) => ({
  type: types.GET_DASHBOARD_DATA,
  platform,
  emptyValue
});

export const setDashboardData = data => ({
  type: types.SET_DASHBOARD_DATA,
  data
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
    case types.SET_DASHBOARD_DATA: {
      return {
        ...state,
        dashboardData: action.data
      };
    }
    default:
      return state;
  }
}
