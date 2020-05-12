const prefix = "app/dataEntry/reducer/completedVisit";

export const types = {
  GET_COMPLETEDVISIT: `${prefix}GET_COMPLETEDVISIT`,
  SET_COMPLETEDVISIT: `${prefix}SET_COMPLETEDVISIT`,
  GET_VISITTYPES: `${prefix}GET_VISITTYPES`,
  SET_VISITTYPES: `${prefix}SET_VISITTYPES`
};

export const getCompletedVisit = completedVisitUuid => ({
  type: types.GET_COMPLETEDVISIT,
  completedVisitUuid
});

export const setCompletedVisit = completedVisit => ({
  type: types.SET_COMPLETEDVISIT,
  completedVisit
});

export const getVisitTypes = visitTypesUuid => ({
  type: types.GET_VISITTYPES,
  visitTypesUuid
});

export const setVisitTypes = visitTypes => ({
  type: types.SET_VISITTYPES,
  visitTypes
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_COMPLETEDVISIT: {
      return {
        ...state,
        completedVisits: action.completedVisit
      };
    }
    case types.SET_VISITTYPES: {
      return {
        ...state,
        visitTypes: action.visitTypes
      };
    }
    default:
      return state;
  }
}
