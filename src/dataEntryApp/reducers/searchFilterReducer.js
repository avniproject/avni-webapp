import { filter, find, get, includes, intersection, isEmpty, isNil, map, reduce, some, sortBy, toLower, uniq } from "lodash";

const prefix = "app/dataEntry/reducer/searchFilter/";

export const types = {
  ADD_SEARCH_REQUEST: `${prefix}ADD_SEARCH_REQUEST`,
  RESET_SEARCH_REQUEST: `${prefix}RESET_SEARCH_REQUEST`
};

export const SEARCH_REQUEST_STORAGE_KEY = "avni.dataEntry.searchRequest";

const defaultRequest = { includeVoided: false, includeDisplayCount: false };

export const SEARCH_REQUEST_OWNER_STORAGE_KEY = "avni.dataEntry.searchRequest.username";

export const SEARCH_RESULTS_TABLE_STORAGE_KEY = "avni.dataEntry.searchRequest.resultsTable";

export const SEARCH_RESULTS_PAGE_SIZES = [10, 15, 20];

export const SORTABLE_SEARCH_RESULT_COLUMNS = ["fullName", "subjectType", "gender", "age"];

export const defaultSearchResultsTable = { pagination: { pageIndex: 0, pageSize: 10 }, sorting: [] };

export const saveSearchRequest = (request, username) => {
  try {
    sessionStorage.setItem(SEARCH_REQUEST_STORAGE_KEY, JSON.stringify(request));
    sessionStorage.setItem(SEARCH_REQUEST_OWNER_STORAGE_KEY, username || "");
    sessionStorage.removeItem(SEARCH_RESULTS_TABLE_STORAGE_KEY);
  } catch (e) {
    console.warn("Could not save the search request", e);
  }
};

const toUsablePagination = pagination => {
  const pageIndex = get(pagination, "pageIndex");
  const pageSize = get(pagination, "pageSize");
  return {
    pageIndex: Number.isInteger(pageIndex) && pageIndex >= 0 ? pageIndex : 0,
    pageSize: includes(SEARCH_RESULTS_PAGE_SIZES, pageSize) ? pageSize : defaultSearchResultsTable.pagination.pageSize
  };
};

const toUsableSorting = sorting => {
  const first = Array.isArray(sorting) ? sorting[0] : undefined;
  if (isNil(first) || !includes(SORTABLE_SEARCH_RESULT_COLUMNS, first.id)) return [];
  return [{ id: first.id, desc: first.desc === true }];
};

export const loadSearchResultsTable = () => {
  try {
    if (isNil(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY))) return defaultSearchResultsTable;
    const saved = JSON.parse(sessionStorage.getItem(SEARCH_RESULTS_TABLE_STORAGE_KEY));
    if (!saved || typeof saved !== "object") return defaultSearchResultsTable;
    return { pagination: toUsablePagination(saved.pagination), sorting: toUsableSorting(saved.sorting) };
  } catch (e) {
    return defaultSearchResultsTable;
  }
};

export const saveSearchResultsTable = ({ pagination, sorting }) => {
  try {
    if (isNil(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY))) return;
    sessionStorage.setItem(SEARCH_RESULTS_TABLE_STORAGE_KEY, JSON.stringify({ pagination, sorting }));
  } catch (e) {
    console.warn("Could not save the search results page and sort", e);
  }
};

export const clearSavedSearchRequest = () => {
  try {
    sessionStorage.removeItem(SEARCH_REQUEST_STORAGE_KEY);
    sessionStorage.removeItem(SEARCH_REQUEST_OWNER_STORAGE_KEY);
    sessionStorage.removeItem(SEARCH_RESULTS_TABLE_STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear the saved search request", e);
  }
};

export const clearSearchRequestSavedByOtherUser = username => {
  try {
    if (isNil(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY))) return false;
    if (!isEmpty(username) && sessionStorage.getItem(SEARCH_REQUEST_OWNER_STORAGE_KEY) === username) return false;
  } catch {
    return false;
  }
  clearSavedSearchRequest();
  return true;
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

export const searchRequestAfterReset = (request, subjectTypes) => {
  const subjectType = get(request, "subjectType");
  if (isNil(subjectType) || !some(subjectTypes, ({ uuid }) => uuid === subjectType)) return undefined;
  return { ...defaultRequest, subjectType };
};

export const programsOfSubjectType = (operationalModules, subjectTypeUUID) => {
  const programUUIDs = uniq(
    (operationalModules?.formMappings || [])
      .filter(fm => fm.formType === "ProgramEnrolment" && fm.subjectTypeUUID === subjectTypeUUID && !isNil(fm.programUUID))
      .map(fm => fm.programUUID)
  );
  return sortBy((operationalModules?.programs || []).filter(p => programUUIDs.includes(p.uuid)), p =>
    toLower(p.operationalProgramName || p.name)
  );
};

const hasProgramTicks = request =>
  !isEmpty(request.programs) || !!request.notEnrolledInAnyProgram || !!request.includeExitedEnrolments;

// The form shows the programme ticks only for programmes the subject type still offers, under a Program filter.
const withOfferedPrograms = (request, searchFilters, operationalModules) => {
  if (!hasProgramTicks(request)) return request;
  const offeredUUIDs = map(programsOfSubjectType(operationalModules, request.subjectType), "uuid");
  const hasProgramFilter = some(searchFilters, ({ subjectTypeUUID, type }) => subjectTypeUUID === request.subjectType && type === "Program");
  if (!hasProgramFilter || isEmpty(offeredUUIDs)) {
    return { ...request, programs: [], notEnrolledInAnyProgram: false, includeExitedEnrolments: false };
  }
  const programs = intersection(request.programs || [], offeredUUIDs);
  return programs.length === (request.programs || []).length ? request : { ...request, programs };
};

export const isSameConceptFilter = (one, other) => one.conceptUUID === other.conceptUUID && one.scope === other.scope;

export const savedConceptOf = (savedConcepts, configured, configuredConcepts) => {
  const sameConcept = filter(savedConcepts, ({ uuid }) => uuid === configured.conceptUUID);
  const sameScope = find(sameConcept, ({ searchScope }) => searchScope === configured.scope);
  if (!isNil(sameScope)) return sameScope;
  const isOnlyFilterOfConcept = filter(configuredConcepts, ({ conceptUUID }) => conceptUUID === configured.conceptUUID).length === 1;
  return isOnlyFilterOfConcept && sameConcept.length === 1 ? sameConcept[0] : undefined;
};

export const toUsableSearchRequest = (savedRequest, subjectTypes, searchFilters, operationalModules) => {
  if (isNil(savedRequest) || isNil(savedRequest.subjectType)) return savedRequest;
  // "Not enrolled" and "Include exited" can't be ticked together; a search saved before that rule keeps "Include exited".
  const withOneExitTick =
    savedRequest.notEnrolledInAnyProgram && savedRequest.includeExitedEnrolments
      ? { ...savedRequest, notEnrolledInAnyProgram: false }
      : savedRequest;
  if (!some(subjectTypes, ({ uuid }) => uuid === withOneExitTick.subjectType)) return defaultRequest;
  const request = withOfferedPrograms(withOneExitTick, searchFilters, operationalModules);
  if (isEmpty(request.concept)) return request;
  const configuredConcepts = filter(
    searchFilters,
    ({ subjectTypeUUID, type }) => subjectTypeUUID === request.subjectType && type === "Concept"
  );
  const concept = reduce(
    configuredConcepts,
    (usable, configured) => {
      const savedConcept = savedConceptOf(request.concept, configured, configuredConcepts);
      if (isNil(savedConcept)) return usable;
      if (!isNil(configured.conceptDataType) && toLower(configured.conceptDataType) !== toLower(savedConcept.dataType)) return usable;
      if (toLower(configured.widget || "Default") !== toLower(savedConcept.widget || "Default")) return usable;
      usable.push(isNil(configured.scope) ? savedConcept : { ...savedConcept, searchScope: configured.scope });
      return usable;
    },
    []
  );
  const unchanged =
    concept.length === request.concept.length &&
    concept.every((c, i) => c.uuid === request.concept[i].uuid && c.searchScope === request.concept[i].searchScope);
  return unchanged ? request : { ...request, concept };
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
