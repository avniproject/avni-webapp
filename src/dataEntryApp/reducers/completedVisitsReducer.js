const prefix = "app/dataEntry/reducer/completedVisit";

export const types = {
  GET_COMPLETEDVISIT: `${prefix}GET_COMPLETEDVISIT`,
  SET_COMPLETEDVISIT: `${prefix}SET_COMPLETEDVISIT`,
  GET_ENROLMENTS: `${prefix}GET_ENROLMENTS`,
  SET_ENROLMENTS: `${prefix}SET_ENROLMENTS`,
  ADD_ENROLLDATA: `${prefix}ADD_ENROLLDATA`
};

export const getCompletedVisit = completedVisitUrl => ({
  type: types.GET_COMPLETEDVISIT,
  completedVisitUrl
});

export const setCompletedVisit = completedVisit => ({
  type: types.SET_COMPLETEDVISIT,
  completedVisit
});

export const getEnrolments = enrolmentUuid => ({
  type: types.GET_ENROLMENTS,
  enrolmentUuid
});

export const setEnrolments = enrolments => ({
  type: types.SET_ENROLMENTS,
  enrolments
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_COMPLETEDVISIT: {
      return {
        ...state,
        completedVisits: action.completedVisit
      };
    }
    case types.SET_ENROLMENTS: {
      return {
        ...state,
        enrolments: action.enrolments
      };
    }
    case types.ADD_ENROLLDATA: {
      return {
        ...state,
        enrolldata: action.value
      };
    }
    default:
      return state;
  }
}
