export const types = {
  GET_TRANSLATION: "GET_TRANSLATION",
  SET_TRANSLATION: "SET_TRANSLATION",
  TRANSLATION_DATA: "TRANSLATION_DATA",
  GET_ORG_CONFIG: "app/GET_ORG_CONFIG",
  SET_ORG_CONFIG: "app/SET_ORG_CONFIG"
};

export const getOrgConfigInfo = () => ({
  type: types.GET_ORG_CONFIG
});

export const setOrgConfigInfo = orgConfig => ({
  type: types.SET_ORG_CONFIG,
  payload: orgConfig
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_ORG_CONFIG: {
      return {
        ...state,
        orgConfig: action.payload
      };
    }
    default:
      return state;
  }
}
