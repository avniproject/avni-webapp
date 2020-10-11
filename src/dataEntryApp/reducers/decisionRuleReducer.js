import api from "dataEntryApp/api/index";

export const selectDecisions = state => state.dataEntry.decisionRuleReducer.decisions;
export const selectFetchingDecisions = state => state.dataEntry.decisionRuleReducer.isFetching;
export const selectDecisionsError = state => state.dataEntry.decisionRuleReducer.error;

const prefix = "app/dataEntry/reducer/decision/";

export const types = {
  SET_DECISIONS: `${prefix}SET_DECISIONS`,
  SET_ERROR: `${prefix}SET_ERROR`,
  REQUEST_DECISIONS: `${prefix}REQUEST_DECISIONS`
};

export const setDecisions = decisions => ({
  type: types.SET_DECISIONS,
  decisions
});

export const setError = error => ({
  type: types.SET_ERROR,
  error
});

export const requestVisitSchedules = () => ({
  type: types.REQUEST_DECISIONS
});

export const fetchDecisions = requestBody => {
  return dispatch => {
    dispatch(requestVisitSchedules());
    return api
      .fetchDecisions(requestBody)
      .then(decisions => {
        dispatch(setDecisions(decisions));
      })
      .catch(err => {
        dispatch(setError(err.message));
      });
  };
};

export default function(
  state = {
    decisions: [],
    isFetching: false,
    error: null
  },
  action
) {
  switch (action.type) {
    case types.SET_DECISIONS: {
      return {
        ...state,
        decisions: action.decisions,
        isFetching: false,
        error: null
      };
    }
    case types.REQUEST_DECISIONS: {
      return {
        ...state,
        decisions: [],
        isFetching: true,
        error: null
      };
    }
    case types.SET_ERROR: {
      return {
        ...state,
        decisions: [],
        isFetching: false,
        error: action.error
      };
    }
    default:
      return state;
  }
}
