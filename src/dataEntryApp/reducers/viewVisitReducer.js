const prefix = "app/dataEntry/reducer/viewVisit";

export const types = {
  GET_VIEWVISIT: `${prefix}GET_VIEWVISIT`,
  SET_VIEWVISIT: `${prefix}SET_VIEWVISIT`
};

export const getViewVisit = viewVisitUuid => ({
  type: types.GET_VIEWVISIT,
  viewVisitUuid
});

export const setViewVisit = viewVisit => ({
  type: types.SET_VIEWVISIT,
  viewVisit
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_VIEWVISIT: {
      return {
        ...state,
        viewVisits: action.viewVisit
      };
    }
    default:
      return state;
  }
}
