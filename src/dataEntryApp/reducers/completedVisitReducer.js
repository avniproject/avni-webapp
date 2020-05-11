const prefix = "app/dataEntry/reducer/completedVisit";

export const types = {
  GET_COMPLETEDVISIT: `${prefix}GET_COMPLETEDVISIT`,
  SET_COMPLETEDVISIT: `${prefix}SET_COMPLETEDVISIT`
};

export const getCompletedVisit = completedVisitUuid => ({
  type: types.GET_COMPLETEDVISIT,
  completedVisitUuid
});

export const setCompletedVisit = completedVisit => ({
  type: types.SET_COMPLETEDVISIT,
  completedVisit
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_COMPLETEDVISIT: {
      return {
        ...state,
        completedVisits: action.completedVisit
      };
    }
    default:
      return state;
  }
}
