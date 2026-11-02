import { filter, includes, isEmpty, isNil, map, some } from "lodash";

const prefix = "app/dataEntry/reducer/searchFilter/";

export const types = {
  ADD_SEARCH_REQUEST: `${prefix}ADD_SEARCH_REQUEST`,
  RESET_SEARCH_REQUEST: `${prefix}RESET_SEARCH_REQUEST`
};

export const SEARCH_REQUEST_STORAGE_KEY = "avni.dataEntry.searchRequest";

const defaultRequest = { includeVoided: false, includeDisplayCount: false };

export const saveSearchRequest = request => {
  try {
    sessionStorage.setItem(SEARCH_REQUEST_STORAGE_KEY, JSON.stringify(request));
  } catch (e) {
    console.warn("Could not save the search request", e);
  }
};

export const clearSavedSearchRequest = () => {
  try {
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

export const resetSearchRequest = () => ({ type: types.RESET_SEARCH_REQUEST });

export const toUsableSearchRequest = (request, subjectTypes, searchFilters) => {
  if (isNil(request) || isNil(request.subjectType)) return request;
  if (!some(subjectTypes, ({ uuid }) => uuid === request.subjectType)) return defaultRequest;
  if (isEmpty(request.concept)) return request;
  const configuredConceptUUIDs = map(
    filter(searchFilters, ({ subjectTypeUUID, type }) => subjectTypeUUID === request.subjectType && type === "Concept"),
    "conceptUUID"
  );
  const concept = filter(request.concept, ({ uuid }) => includes(configuredConceptUUIDs, uuid));
  return concept.length === request.concept.length ? request : { ...request, concept };
};

export default function(state = getInitialState(), action) {
  switch (action.type) {
    case types.ADD_SEARCH_REQUEST: {
      return {
        ...state,
        request: action.value
      };
    }
    case types.RESET_SEARCH_REQUEST: {
      return {
        ...state,
        request: defaultRequest
      };
    }
    default:
      return state;
  }
}
