import { filter, includes, intersection, isEmpty, isNil, map, some, sortBy, toLower, uniq } from "lodash";

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
