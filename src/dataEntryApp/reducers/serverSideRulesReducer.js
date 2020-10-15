import api from "dataEntryApp/api/index";

const prefix = "app/dataEntry/reducer/serverSideRules/";

export const types = {
  SET_RULES_RESPONSE: `${prefix}SET_RULES_RESPONSE`,
  SET_ERROR: `${prefix}SET_ERROR`,
  REQUEST_RULES_RESPONSE: `${prefix}REQUEST_RULES_RESPONSE`
};

export const setRulesResponse = rulesResponse => ({
  type: types.SET_RULES_RESPONSE,
  rulesResponse
});

export const setError = error => ({
  type: types.SET_ERROR,
  error
});

export const requestRulesResponse = () => ({
  type: types.REQUEST_RULES_RESPONSE
});

export const fetchRulesResponse = requestBody => {
  return dispatch => {
    dispatch(requestRulesResponse());
    return api
      .getRulesResponse(requestBody)
      .then(rulesResponse => {
        dispatch(setRulesResponse(rulesResponse));
      })
      .catch(err => {
        dispatch(setError(err.message));
      });
  };
};

export const selectRulesResponse = state => state.dataEntry.serverSideRulesReducer.rulesResponse;
export const selectVisitSchedules = state =>
  state.dataEntry.serverSideRulesReducer.rulesResponse.visitSchedules;
export const selectDecisions = state =>
  state.dataEntry.serverSideRulesReducer.rulesResponse.decisions;
export const selectFetchingRulesResponse = state =>
  state.dataEntry.serverSideRulesReducer.isFetching;
export const selectError = state => state.dataEntry.serverSideRulesReducer.error;

export default function(
  state = {
    rulesResponse: {},
    isFetching: false,
    error: null
  },
  action
) {
  switch (action.type) {
    case types.SET_RULES_RESPONSE: {
      return {
        ...state,
        rulesResponse: action.rulesResponse,
        isFetching: false,
        error: null
      };
    }
    case types.REQUEST_RULES_RESPONSE: {
      return {
        ...state,
        rulesResponse: {},
        isFetching: true,
        error: null
      };
    }
    case types.SET_ERROR: {
      return {
        ...state,
        rulesResponse: {},
        isFetching: false,
        error: action.error
      };
    }
    default:
      return state;
  }
}
