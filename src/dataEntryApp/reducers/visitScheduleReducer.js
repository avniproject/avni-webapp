import api from "dataEntryApp/api/index";

export const selectVisitSchedules = state => state.dataEntry.visitScheduleReducer.visitSchedules;
export const selectIsFetching = state => state.dataEntry.visitScheduleReducer.isFetching;
export const selectError = state => state.dataEntry.visitScheduleReducer.error;

const prefix = "app/dataEntry/reducer/visitSchedule/";

export const types = {
  SET_VISIT_SCHEDULES: `${prefix}SET_VISIT_SCHEDULES`,
  SET_ERROR: `${prefix}SET_ERROR`,
  REQUEST_VISIT_SCHEDULES: `${prefix}REQUEST_VISIT_SCHEDULES`
};

export const setVisitSchedules = visitSchedules => ({
  type: types.SET_VISIT_SCHEDULES,
  visitSchedules
});

export const setError = error => ({
  type: types.SET_ERROR,
  error
});

export const requestVisitSchedules = () => ({
  type: types.REQUEST_VISIT_SCHEDULES
});

export const fetchVisitSchedules = requestBody => {
  return dispatch => {
    dispatch(requestVisitSchedules());
    return api
      .fetchVisitSchedules(requestBody)
      .then(visitSchedules => {
        dispatch(setVisitSchedules(visitSchedules));
      })
      .catch(err => {
        dispatch(setError(err.message));
      });
  };
};

export default function(
  state = {
    visitSchedules: [],
    isFetching: false,
    error: null
  },
  action
) {
  switch (action.type) {
    case types.SET_VISIT_SCHEDULES: {
      return {
        ...state,
        visitSchedules: action.visitSchedules,
        isFetching: false,
        error: null
      };
    }
    case types.REQUEST_VISIT_SCHEDULES: {
      return {
        ...state,
        visitSchedules: [],
        isFetching: true,
        error: null
      };
    }
    case types.SET_ERROR: {
      return {
        ...state,
        visitSchedules: [],
        isFetching: false,
        error: action.error
      };
    }
    default:
      return state;
  }
}
