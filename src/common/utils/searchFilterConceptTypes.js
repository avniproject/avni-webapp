// Concept data types the Data Entry App search can filter on, the same set the phone filters on.
export const SUPPORTED_CONCEPT_FILTER_TYPES = ["Coded", "Text", "Id", "Notes", "Numeric", "Date", "DateTime", "Time"];

export const isSupportedConceptType = (dataType) => SUPPORTED_CONCEPT_FILTER_TYPES.includes(dataType);

// A Concept search filter on any other type, such as an answer concept (NA), can't be shown, so search leaves it out.
export const isShowableSearchFilter = (searchFilter) =>
  searchFilter?.type !== "Concept" || isSupportedConceptType(searchFilter.conceptDataType);

export const showableSearchFilters = (searchFilters, subjectTypeUUID) =>
  (searchFilters || []).filter((searchFilter) => searchFilter.subjectTypeUUID === subjectTypeUUID && isShowableSearchFilter(searchFilter));
