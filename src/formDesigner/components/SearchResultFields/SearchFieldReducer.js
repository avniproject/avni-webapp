import { head, get } from "lodash";

const setData = (searchResultFieldState, searchResultFields) => {
  const newState = searchResultFieldState.clone();
  newState.onLoad(searchResultFields);
  return newState;
};

const setMetadata = (searchResultFieldState, metadata) => {
  const newState = searchResultFieldState.clone();
  newState.subjectTypeMetadata = metadata;
  const first = head(metadata);
  newState.selectedSubjectTypeUUID = get(first, "subjectType.uuid");
  newState.loadApp = true;
  return newState;
};

const subjectTypeChange = (searchResultFieldState, { subjectTypeUUID }) => {
  const newState = searchResultFieldState.clone();
  newState.selectedSubjectTypeUUID = subjectTypeUUID;
  return newState;
};

const changeOrder = (searchResultFieldState, { searchResultConcepts }) => {
  const newState = searchResultFieldState.clone();
  const searchResultField = newState.getSearchResultField();
  searchResultField.reOrderConceptDetails(searchResultConcepts);
  return newState;
};

const addCustomField = (searchResultFieldState, { concept }) => {
  const newState = searchResultFieldState.clone();
  const searchResultField = newState.getSearchResultField();
  const { name, uuid } = concept;
  searchResultField.push(name, uuid);
  return newState;
};

const deleteField = (searchResultFieldState, { uuid }) => {
  const newState = searchResultFieldState.clone();
  newState.deleteFieldByUUID(uuid);
  return newState;
};

const saveOk = searchResultFieldState => {
  const newState = searchResultFieldState.clone();
  newState.feedbackMessage = { message: "Saved successfully", variant: "success" };
  return newState;
};

const saveError = searchResultFieldState => {
  const newState = searchResultFieldState.clone();
  newState.feedbackMessage = { message: "Error while saving", variant: "error" };
  return newState;
};

const resetFeedback = searchResultFieldState => {
  const newState = searchResultFieldState.clone();
  newState.feedbackMessage = undefined;
  return newState;
};

export const SearchFieldReducer = (searchResultFieldState, action) => {
  const actionFns = {
    setData: setData,
    setMetadata: setMetadata,
    subjectTypeChange: subjectTypeChange,
    changeOrder: changeOrder,
    addCustomField: addCustomField,
    deleteField: deleteField,
    saveOk: saveOk,
    saveError: saveError,
    resetFeedback: resetFeedback
  };
  const actionFn = actionFns[action.type] || (() => searchResultFieldState);
  return actionFn(searchResultFieldState, action.payload);
};
