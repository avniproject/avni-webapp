const prefix = "app/dataEntry/reducer/encounter/";

export const types = {
  ON_LOAD: `${prefix}ON_LOAD`,
  SET_ENCOUNTER_FORM_MAPPINGS: `${prefix}SET_ENCOUNTER_FORM_MAPPINGS`,
  GET_ENCOUNTER_FORM: `${prefix}GET_ENCOUNTER_FORM`,
  SET_ENCOUNTER_FORM: `${prefix}SET_ENCOUNTER_FORM`,
  SET_ENCOUNTER: `${prefix}SET_ENCOUNTER`,
  UPDATE_OBS: `${prefix}UPDATE_OBS`,
  UPDATE_ENCOUNTER: `${prefix}UPDATE_ENCOUNTER`,
  SET_VALIDATION_RESULTS: `${prefix}SET_VALIDATION_RESULTS`,
  SET_ENCOUNTER_DATE_VALIDATION: `${prefix}SET_ENCOUNTER_DATE_VALIDATION`,
  RESET_STATE: `${prefix}RESET_STATE`
};

export const setEncounterFormMappings = encounterFormMappings => ({
  type: types.SET_ENCOUNTER_FORM_MAPPINGS,
  encounterFormMappings
});

export const onLoad = subjectUuid => ({
  type: types.ON_LOAD,
  subjectUuid
});

export const getEncounterForm = (encounterTypeUuid, subjectUuid) => ({
  type: types.GET_ENCOUNTER_FORM,
  encounterTypeUuid,
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

const initialState = {
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
        validationResults: [],
        enconterDateValidation: [],
        encounter: null,
        encounterForm: null
      };
    }
    default:
      return state;
  }
}
