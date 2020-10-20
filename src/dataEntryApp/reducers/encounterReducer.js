import { fetchRulesResponse } from "dataEntryApp/reducers/serverSideRulesReducer";

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
  SET_ENCOUNTER_DATE_VALIDATION: `${prefix}SET_ENCOUNTER_DATE_VALIDATION`,
  RESET_STATE: `${prefix}RESET_STATE`,
  CREATE_ENCOUNTER: `${prefix}CREATE_ENCOUNTER`,
  CREATE_ENCOUNTER_FOR_SCHEDULED: `${prefix}CREATE_ENCOUNTER_FOR_SCHEDULED`,
  EDIT_ENCOUNTER: `${prefix}EDIT_ENCOUNTER`,
  UPDATE_CANCEL_OBS: `${prefix}UPDATE_CANCEL_OBS`,
  CREATE_CANCEL_ENCOUNTER: `${prefix}CREATE_CANCEL_ENCOUNTER`,
  EDIT_CANCEL_ENCOUNTER: `${prefix}EDIT_CANCEL_ENCOUNTER`
};

export const setEncounterFormMappings = encounterFormMappings => ({
  type: types.SET_ENCOUNTER_FORM_MAPPINGS,
  encounterFormMappings
});

export const onLoad = subjectUuid => ({
  type: types.ON_LOAD,
  subjectUuid
});

export const setEncounterForm = encounterForm => ({
  type: types.SET_ENCOUNTER_FORM,
  encounterForm
});

export const setEncounter = encounter => ({
  type: types.SET_ENCOUNTER,
  encounter
});

export const updateObs = (formElement, value) => ({
  type: types.UPDATE_OBS,
  formElement,
  value
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

export const setEncounterDateValidation = enconterDateValidation => ({
  type: types.SET_ENCOUNTER_DATE_VALIDATION,
  enconterDateValidation
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

export const fetchEncounterRulesResponse = () => {
  return (dispatch, getState) => {
    const state = getState();
    const requestEntity = state.dataEntry.encounterReducer.encounter.toResource;
    dispatch(
      fetchRulesResponse({
        encounterRequestEntity: requestEntity,
        rule: {
          formUuid: state.dataEntry.encounterReducer.encounterForm.uuid,
          ruleType: "VisitSchedule",
          workFlowType: "Encounter"
        }
      })
    );
  };
};

const initialState = {
  saved: false,
  validationResults: [],
  enconterDateValidation: []
};

export default function(state = initialState, action) {
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
    case types.SAVE_ENCOUNTER_COMPLETE: {
      return {
        ...state,
        saved: true
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
    case types.SET_ENCOUNTER_DATE_VALIDATION: {
      return {
        ...state,
        enconterDateValidation: action.enconterDateValidation
      };
    }
    case types.RESET_STATE: {
      return {
        ...state,
        saved: false,
        validationResults: [],
        enconterDateValidation: [],
        encounter: null,
        encounterForm: null,
        encounterFormMappings: null
      };
    }
    default:
      return state;
  }
}
