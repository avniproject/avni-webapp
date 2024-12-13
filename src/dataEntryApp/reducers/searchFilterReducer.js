const prefix = "app/dataEntry/reducer/searchFilter/";

export const types = {
  ADD_SEARCH_REQUEST: `${prefix}ADD_SEARCH_REQUEST`
};

const initialState = { request: { includeVoided: false, includeDisplayCount: false } };

export default function(state = initialState, action) {
  switch (action.type) {
    case types.ADD_SEARCH_REQUEST: {
      return {
        ...state,
        request: action.value
      };
    }
    default:
      return state;
  }
}
