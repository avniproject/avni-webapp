import { find, map, get, size, remove } from "lodash";

class SearchResultFieldState {
  constructor() {
    this.selectedSubjectTypeUUID = undefined;
    this.searchResultFields = [];
    this.subjectTypeMetadata = [];
    this.loadApp = false;
    this.feedbackMessage = undefined;
  }

  onLoad(searchResultFields = []) {
    this.searchResultFields = map(
      searchResultFields,
      ({ subjectTypeName, subjectTypeUUID, searchResultConcepts }) =>
        new SearchResultField(subjectTypeName, subjectTypeUUID, searchResultConcepts)
    );
  }

  getFieldsForSelectedSubjectType() {
    const searchResultField = find(
      this.searchResultFields,
      ({ subjectTypeUUID }) => subjectTypeUUID === this.selectedSubjectTypeUUID
    );
    return get(searchResultField, "searchResultConcepts", []);
  }

  getSearchResultField() {
    const searchResultField = find(
      this.searchResultFields,
      ({ subjectTypeUUID }) => subjectTypeUUID === this.selectedSubjectTypeUUID
    );
    if (searchResultField) {
      return searchResultField;
    } else {
      const { subjectType } = find(
        this.subjectTypeMetadata,
        ({ subjectType }) => subjectType.uuid === this.selectedSubjectTypeUUID
      );
      const searchResultField = new SearchResultField(subjectType.name, subjectType.uuid);
      this.searchResultFields.push(searchResultField);
      return searchResultField;
    }
  }

  deleteFieldByUUID(conceptUUID) {
    const searchResultConcepts = this.getFieldsForSelectedSubjectType();
    remove(searchResultConcepts, ({ uuid }) => uuid === conceptUUID);
  }

  clone() {
    const searchResultFieldState = new SearchResultFieldState();
    searchResultFieldState.selectedSubjectTypeUUID = this.selectedSubjectTypeUUID;
    searchResultFieldState.searchResultFields = map(this.searchResultFields, srf => srf.clone());
    searchResultFieldState.subjectTypeMetadata = this.subjectTypeMetadata;
    searchResultFieldState.loadApp = this.loadApp;
    return searchResultFieldState;
  }
}

class SearchResultField {
  constructor(subjectTypeName, subjectTypeUUID, searchResultConcepts = []) {
    this.subjectTypeName = subjectTypeName;
    this.subjectTypeUUID = subjectTypeUUID;
    this.searchResultConcepts = searchResultConcepts;
  }

  addConceptDetails(name, uuid, displayOrder) {
    this.searchResultConcepts.push({ name, uuid, displayOrder });
  }

  reOrderConceptDetails(newConceptDetails) {
    this.searchResultConcepts = [];
    map(newConceptDetails, ({ name, uuid }, index) =>
      this.addConceptDetails(name, uuid, index + 1)
    );
  }

  push(name, uuid) {
    const displayOrder = size(this.searchResultConcepts) + 1;
    this.addConceptDetails(name, uuid, displayOrder);
  }

  clone() {
    const searchResultField = new SearchResultField();
    searchResultField.subjectTypeName = this.subjectTypeName;
    searchResultField.subjectTypeUUID = this.subjectTypeUUID;
    searchResultField.searchResultConcepts = this.searchResultConcepts;
    return searchResultField;
  }
}

export default SearchResultFieldState;
