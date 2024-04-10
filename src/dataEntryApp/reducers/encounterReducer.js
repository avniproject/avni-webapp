import { fetchRulesResponse } from "dataEntryApp/reducers/serverSideRulesReducer";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";

const prefix = "app/dataEntry/reducer/encounter/";

export const types = {
  ON_LOAD: `${prefix}ON_LOAD`,
  SET_ENCOUNTER_FORM_MAPPINGS: `${prefix}SET_ENCOUNTER_FORM_MAPPINGS`,
  SET_ENCOUNTER_FORM: `${prefix}SET_ENCOUNTER_FORM`,
  SET_ENCOUNTER: `${prefix}SET_ENCOUNTER`,
  SAVE_ENCOUNTER: `${prefix}SAVE_ENCOUNTER`,
  UPDATE_OBS: `${prefix}UPDATE_OBS`,
  SAVE_ENCOUNTER_COMPLETE: `${prefix}SAVE_ENCOUNTER_COMPLETE`,
  UPDATE_ENCOUNTER: `${prefix}UPDATE_ENCOUNTER`,
  SET_VALIDATION_RESULTS: `${prefix}SET_VALIDATION_RESULTS`,
  RESET_STATE: `${prefix}RESET_STATE`,
  CREATE_ENCOUNTER: `${prefix}CREATE_ENCOUNTER`,
  CREATE_ENCOUNTER_FOR_SCHEDULED: `${prefix}CREATE_ENCOUNTER_FOR_SCHEDULED`,
  EDIT_ENCOUNTER: `${prefix}EDIT_ENCOUNTER`,
  UPDATE_CANCEL_OBS: `${prefix}UPDATE_CANCEL_OBS`,
  CREATE_CANCEL_ENCOUNTER: `${prefix}CREATE_CANCEL_ENCOUNTER`,
  EDIT_CANCEL_ENCOUNTER: `${prefix}EDIT_CANCEL_ENCOUNTER`,
  ON_LOAD_SUCCESS: `${prefix}ON_LOAD_SUCCESS`,
  ON_NEXT: `${prefix}ON_NEXT`,
  ON_PREVIOUS: `${prefix}ON_PREVIOUS`,
  SET_STATE: `${prefix}SET_STATE`,
  SET_ENCOUNTER_DATE: `${prefix}SET_ENCOUNTER_DATE`,
  SET_FILTERED_FORM_ELEMENTS: `${prefix}SET_FILTERED_FORM_ELEMENTS`,
  GET_ELIGIBLE_ENCOUNTERS: `${prefix}GET_ELIGIBLE_ENCOUNTERS`,
  SET_ELIGIBLE_ENCOUNTERS: `${prefix}SET_ELIGIBLE_ENCOUNTERS`,
  ADD_NEW_QG: `${prefix}ADD_NEW_QG`,
  REMOVE_QG: `${prefix}REMOVE_QG`
};

export const setEncounterFormMappings = encounterFormMappings => ({
  type: types.SET_ENCOUNTER_FORM_MAPPINGS,
  encounterFormMappings
});

export const onLoad = subjectUuid => ({
  type: types.ON_LOAD,
  subjectUuid
});

export const getEligibleEncounters = subjectUuid => ({
  type: types.GET_ELIGIBLE_ENCOUNTERS,
  subjectUuid
});

export const setEligibleEncounters = eligibleEncounters => ({
  type: types.SET_ELIGIBLE_ENCOUNTERS,
  eligibleEncounters
});

export const onLoadSuccess = (encounter, encounterForm, formElementGroup, filteredFormElements, onSummaryPage, wizard, isFormEmpty) => ({
  type: types.ON_LOAD_SUCCESS,
  encounter,
  encounterForm,
  formElementGroup,
  filteredFormElements,
  onSummaryPage,
  wizard,
  isFormEmpty
});

export const setEncounterForm = encounterForm => ({
  type: types.SET_ENCOUNTER_FORM,
  encounterForm
});

export const setEncounter = encounter => ({
  type: types.SET_ENCOUNTER,
  encounter
});

export const updateObs = (formElement, value, childFormElement, questionGroupIndex) => ({
  type: types.UPDATE_OBS,
  formElement,
  value,
  childFormElement,
  questionGroupIndex
});

export const addNewQuestionGroup = formElement => ({
  type: types.ADD_NEW_QG,
  formElement
});

export const removeQuestionGroup = (formElement, questionGroupIndex) => ({
  type: types.REMOVE_QG,
  formElement,
  questionGroupIndex
});

export const saveEncounter = isCancel => ({
  type: types.SAVE_ENCOUNTER,
  isCancel
});

export const saveEncounterComplete = () => ({
  type: types.SAVE_ENCOUNTER_COMPLETE
});

export const updateEncounter = (field, value) => ({
  type: types.UPDATE_ENCOUNTER,
  field,
  value
});

export const setValidationResults = validationResults => ({
  type: types.SET_VALIDATION_RESULTS,
  validationResults
});

export const resetState = () => ({
  type: types.RESET_STATE
});

export const createEncounter = (encounterTypeUuid, subjectUuid) => ({
  type: types.CREATE_ENCOUNTER,
  encounterTypeUuid,
  subjectUuid
});

export const createEncounterForScheduled = encounterUuid => ({
  type: types.CREATE_ENCOUNTER_FOR_SCHEDULED,
  encounterUuid
});

export const editEncounter = encounterUuid => ({
  type: types.EDIT_ENCOUNTER,
  encounterUuid
});

export const updateCancelObs = (formElement, value) => ({
  type: types.UPDATE_CANCEL_OBS,
  formElement,
  value
});

export const createCancelEncounter = encounterUuid => ({
  type: types.CREATE_CANCEL_ENCOUNTER,
  encounterUuid
});

export const editCancelEncounter = encounterUuid => ({
  type: types.EDIT_CANCEL_ENCOUNTER,
  encounterUuid
});

export const onNext = isCancel => ({
  type: types.ON_NEXT,
  isCancel
});

export const onPrevious = isCancel => ({
  type: types.ON_PREVIOUS,
  isCancel
});

export const setState = state => ({
  type: types.SET_STATE,
  state
});

export const setEncounterDate = encounterDate => ({
  type: types.SET_ENCOUNTER_DATE,
  encounterDate
});

export const setFilteredFormElements = filteredFormElements => ({
  type: types.SET_FILTERED_FORM_ELEMENTS,
  filteredFormElements
});

export const fetchEncounterRulesResponse = () => {
  return (dispatch, getState) => {
    const state = getState();
    const requestEntity = state.dataEntry.encounterReducer.encounter.toResource;
    dispatch(
      fetchRulesResponse({
        encounterRequestEntity: requestEntity,
        rule: {
          formUuid: state.dataEntry.encounterReducer.encounterForm.uuid,
          workFlowType: "Encounter"
        }
      })
    );
  };
};

export const selectEncounterState = state => state.dataEntry.encounterReducer;

const initialState = {
  saved: false,
  validationResults: [],
  eligibleEncounters: { scheduledEncounters: [], eligibleEncounterTypeUUIDs: [] }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SET_ENCOUNTER_FORM_MAPPINGS: {
      return {
        ...state,
        encounterFormMappings: action.encounterFormMappings
      };
    }
    case types.SET_ENCOUNTER_FORM: {
      return {
        ...state,
        encounterForm: action.encounterForm
      };
    }
    case types.SET_ENCOUNTER: {
      return {
        ...state,
        encounter: action.encounter
      };
    }
    case types.ON_LOAD_SUCCESS: {
      return {
        ...state,
        encounter: action.encounter,
        encounterForm: action.encounterForm,
        formElementGroup: action.formElementGroup,
        filteredFormElements: action.filteredFormElements,
        onSummaryPage: action.onSummaryPage,
        wizard: action.wizard,
        isFormEmpty: action.isFormEmpty
      };
    }
    case types.SAVE_ENCOUNTER_COMPLETE: {
      return {
        ...state,
        saved: true
      };
    }
    case types.SET_ELIGIBLE_ENCOUNTERS: {
      return {
        ...state,
        eligibleEncounters: action.eligibleEncounters
      };
    }
    case types.UPDATE_ENCOUNTER: {
      const encounter = state.encounter.cloneForEdit();
      encounter[action.field] = action.value;
      return {
        ...state,
        encounter
      };
    }
    case types.SET_VALIDATION_RESULTS: {
      return {
        ...state,
        validationResults: action.validationResults
      };
    }
    case types.SET_ENCOUNTER_DATE: {
      const encounter = state.encounter.cloneForEdit();
      encounter.encounterDateTime = action.encounterDate;
      const validationResults = commonFormUtil.handleValidationResult(encounter.validate(), state.validationResults);

      return {
        ...state,
        encounter,
        validationResults
      };
    }
    case types.RESET_STATE: {
      return {
        ...state,
        saved: false,
        validationResults: [],
        encounter: null,
        encounterForm: null,
        encounterFormMappings: null,
        ...initialState
      };
    }
    case types.SET_STATE: {
      return action.state;
    }
    case types.SET_FILTERED_FORM_ELEMENTS: {
      return {
        ...state,
        filteredFormElements: action.filteredFormElements
      };
    }
    default:
      return state;
  }
};
