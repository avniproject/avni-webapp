const prefix = "app/dataEntry/reducer/encounter/";

export const types = {
  ON_LOAD: `${prefix}ON_LOAD`,
  SET_ENCOUNTER_FORM_MAPPINGS: `${prefix}SET_ENCOUNTER_FORM_MAPPINGS`,
  GET_ENCOUNTER_FORM: `${prefix}GET_ENCOUNTER_FORM`,
  SET_ENCOUNTER_FORM: `${prefix}SET_ENCOUNTER_FORM`,
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

export const resetState = () => ({
  type: types.RESET_STATE
});

// const initialState = {
//   encounterFormMappings: null
// };

export default function(state = {}, action) {
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
    case types.RESET_STATE: {
      return {
        ...state,
        encounterForm: null
      };
    }
    default:
      return state;
  }
}
