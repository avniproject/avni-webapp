const prefix = "app/dataEntry/reducer/searchFilter/";

export const types = {
  GET_SEARCHFILTER: `${prefix}GET_SEARCHFILTER`,
  SET_SEARCHFILTER: `${prefix}SET_SEARCHFILTER`
};

export const getSearchFilters = searchData => ({
  type: types.GET_SEARCHFILTER,
  searchData
});

export const setSearchFilters = searchFilters => ({
  type: types.SET_SEARCHFILTER,
  searchFilters
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_SEARCHFILTER: {
      return {
        ...state,
        searchFilters: action.searchFilters
      };
    }
    default:
      return state;
  }
}
