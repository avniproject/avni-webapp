const prefix = "app/dataEntry/reducer/searchFilter/";

export const types = {
  GET_SEARCHFILTER: `${prefix}GET_SEARCHFILTER`,
  SET_SEARCHFILTER: `${prefix}SET_SEARCHFILTER`,
  ADD_SEARCH_REQUEST: `${prefix}ADD_SEARCH_REQUEST`
};

export const getSearchFilters = searchData => ({
  type: types.GET_SEARCHFILTER,
  searchData
});

export const setSearchFilters = searchFilters => ({
  type: types.SET_SEARCHFILTER,
  searchFilters
});

// export const addSearchResultFilters = selectedSearchResultFilters => ({
//   type: types.ADD_SEARCH_REQUEST,
//   selectedSearchResultFilters
// });
// let request = {};
export default function(state = { request: {} }, action) {
  switch (action.type) {
    case types.SET_SEARCHFILTER: {
      return {
        ...state,
        searchFilters: action.searchFilters
      };
    }
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
