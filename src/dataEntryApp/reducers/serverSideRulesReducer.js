import api from "dataEntryApp/api/index";
import { flatten } from "lodash";
import { mapObservations } from "common/subjectModelMapper";

const prefix = "app/dataEntry/reducer/serverSideRules/";

// Helper function to serialize error objects for Redux state
const serializeError = err => ({
  message: err.message || "Unknown error",
  status: err.response?.status,
  statusText: err.response?.statusText,
  data: err.response?.data?.error || err.response?.data || err.message || "Unknown error"
});

export const types = {
  SET_RULES_RESPONSE: `${prefix}SET_RULES_RESPONSE`,
  SET_ERROR: `${prefix}SET_ERROR`,
  REQUEST_RULES_RESPONSE: `${prefix}REQUEST_RULES_RESPONSE`,
  SET_SUBJECT_SUMMARY: `${prefix}SET_SUBJECT_SUMMARY`,
  SET_PROGRAM_SUMMARY: `${prefix}SET_PROGRAM_SUMMARY`
};

export const setSubjectSummary = subjectSummary => ({
  type: types.SET_SUBJECT_SUMMARY,
  subjectSummary
});

export const setProgramSummary = programSummary => ({
  type: types.SET_PROGRAM_SUMMARY,
  programSummary
});

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
        let decisionObservations = flatten([
          rulesResponse.decisions.enrolmentObservations,
          rulesResponse.decisions.encounterObservations,
          rulesResponse.decisions.registrationObservations
        ]);
        decisionObservations = mapObservations(decisionObservations);
        rulesResponse.decisionObservations = decisionObservations;

        dispatch(setRulesResponse(rulesResponse));
      })
      .catch(err => {
        console.log("Error in executing rule", JSON.stringify(err));
        dispatch(setError(serializeError(err)));
      });
  };
};

export const fetchSubjectSummary = subjectUUID => {
  return dispatch => {
    dispatch(requestRulesResponse());
    return api
      .getSubjectSummary(subjectUUID)
      .then(({ summaryObservations }) => {
        const summary = mapObservations(summaryObservations);
        dispatch(setSubjectSummary(summary));
      })
      .catch(err => {
        const errorData = err.response?.data?.error || err.response?.data || err.message || "Unknown error";
        console.log("Error in executing subject summary rule", JSON.stringify(errorData));
        dispatch(setSubjectSummary([]));
      });
  };
};

export const fetchProgramSummary = enrolmentUUID => {
  return dispatch => {
    dispatch(requestRulesResponse());
    return api
      .getProgramSummary(enrolmentUUID)
      .then(({ summaryObservations }) => {
        const summary = mapObservations(summaryObservations);
        dispatch(setProgramSummary(summary));
      })
      .catch(err => {
        const errorData = err.response?.data?.error || err.response?.data || err.message || "Unknown error";
        console.log("Error in executing program summary rule", JSON.stringify(errorData));
        dispatch(setProgramSummary([]));
      });
  };
};

export const selectRulesResponse = state => state.dataEntry.serverSideRulesReducer.rulesResponse;
export const selectVisitSchedules = state => state.dataEntry.serverSideRulesReducer.rulesResponse.visitSchedules;
export const selectDecisions = state => state.dataEntry.serverSideRulesReducer.rulesResponse.decisions;
export const selectChecklists = state => state.dataEntry.serverSideRulesReducer.rulesResponse.checklists;
export const selectFetchingRulesResponse = state => state.dataEntry.serverSideRulesReducer.isFetching;
export const selectError = state => state.dataEntry.serverSideRulesReducer.error;
export const selectSubjectSummary = state => state.dataEntry.serverSideRulesReducer.subjectSummary;
export const selectProgramSummary = state => state.dataEntry.serverSideRulesReducer.programSummary;

const initialState = {
  rulesResponse: {},
  isFetching: false,
  error: null,
  subjectSummary: [],
  programSummary: []
};

export default function(state = initialState, action) {
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
    case types.SET_SUBJECT_SUMMARY: {
      return {
        ...state,
        subjectSummary: action.subjectSummary,
        isFetching: false
      };
    }
    case types.SET_PROGRAM_SUMMARY: {
      return {
        ...state,
        programSummary: action.programSummary,
        isFetching: false
      };
    }
    default:
      return state;
  }
}
