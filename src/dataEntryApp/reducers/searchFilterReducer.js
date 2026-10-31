const prefix = "app/dataEntry/reducer/searchFilter/";

export const types = {
  ADD_SEARCH_REQUEST: `${prefix}ADD_SEARCH_REQUEST`,
};

export const SEARCH_REQUEST_STORAGE_KEY = "avni.dataEntry.searchRequest";

const defaultRequest = { includeVoided: false, includeDisplayCount: false };

export const saveSearchRequest = (request) => {
  try {
    sessionStorage.setItem(SEARCH_REQUEST_STORAGE_KEY, JSON.stringify(request));
  } catch (e) {
    console.warn("Could not save the search request", e);
  }
};

export const SEARCH_PAGING_STORAGE_KEY = "avni.dataEntry.searchPaging";

// The page and sort order of the results, kept so that coming Back from a subject lands on the same
// page (#502). Saved with the search it belongs to: a different search starts from page 1 again.
export const saveSearchPaging = (request, pagination, sorting) => {
  try {
    sessionStorage.setItem(SEARCH_PAGING_STORAGE_KEY, JSON.stringify({ request: JSON.stringify(request), pagination, sorting }));
  } catch (e) {
    console.warn("Could not save the search page", e);
  }
};

export const loadSearchPaging = (request) => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SEARCH_PAGING_STORAGE_KEY));
    if (saved && saved.request === JSON.stringify(request) && saved.pagination) {
      return { pagination: saved.pagination, sorting: saved.sorting || [] };
    }
  } catch (e) {
    // fall through to the defaults
  }
  return { pagination: { pageIndex: 0, pageSize: 10 }, sorting: [] };
};

export const clearSavedSearchRequest = () => {
  try {
    sessionStorage.removeItem(SEARCH_PAGING_STORAGE_KEY);
    sessionStorage.removeItem(SEARCH_REQUEST_STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear the saved search request", e);
  }
};

const loadSavedSearchRequest = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : defaultRequest;
  } catch (e) {
    return defaultRequest;
  }
};

export const getInitialState = () => ({ request: loadSavedSearchRequest() });

export default function (state = getInitialState(), action) {
  switch (action.type) {
    case types.ADD_SEARCH_REQUEST: {
      return {
        ...state,
        request: action.value,
      };
    }
    default:
      return state;
  }
}
