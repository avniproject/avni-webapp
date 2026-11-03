import {
  SUPPORTED_CONCEPT_FILTER_TYPES,
  isShowableSearchFilter,
  isSupportedConceptType,
  showableSearchFilters,
} from "./searchFilterConceptTypes";

describe("searchFilterConceptTypes", () => {
  it("supports the types the phone filters on", () => {
    expect(SUPPORTED_CONCEPT_FILTER_TYPES).toEqual(["Coded", "Text", "Id", "Notes", "Numeric", "Date", "DateTime", "Time"]);
  });

  it.each(["NA", "Boolean", "QuestionGroup", "Encounter", "Duration", "Location", "Subject", "Image", undefined, null])(
    "does not support %s",
    (dataType) => expect(isSupportedConceptType(dataType)).toBe(false),
  );

  it("shows filters that are not on a concept whatever their data type", () => {
    expect(isShowableSearchFilter({ type: "Name" })).toBe(true);
    expect(isShowableSearchFilter({ type: "Program", conceptDataType: null })).toBe(true);
  });

  it("shows a concept filter only on a supported type", () => {
    expect(isShowableSearchFilter({ type: "Concept", conceptDataType: "Notes" })).toBe(true);
    expect(isShowableSearchFilter({ type: "Concept", conceptDataType: "NA" })).toBe(false);
    expect(isShowableSearchFilter({ type: "Concept" })).toBe(false);
  });

  it("keeps the subject type's showable filters, in order", () => {
    const filters = [
      { type: "Name", subjectTypeUUID: "a" },
      { type: "Concept", conceptDataType: "NA", subjectTypeUUID: "a" },
      { type: "Concept", conceptDataType: "Text", subjectTypeUUID: "b" },
      { type: "Concept", conceptDataType: "Coded", subjectTypeUUID: "a" },
    ];

    expect(showableSearchFilters(filters, "a")).toEqual([filters[0], filters[3]]);
    expect(showableSearchFilters(undefined, "a")).toEqual([]);
  });
});
