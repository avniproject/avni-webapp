const prefix = "app/dataEntry/reducer/encounter/";

export const types = {
  ON_LOAD: `${prefix}ON_LOAD`,
  SET_ENCOUNTER_FORM_MAPPINGS: `${prefix}SET_ENCOUNTER_FORM_MAPPINGS`
};

export const setEncounterFormMappings = encounterFormMappings => ({
  type: types.SET_ENCOUNTER_FORM_MAPPINGS,
  encounterFormMappings
});

export const onLoad = enrolmentUuid => ({
  type: types.ON_LOAD,
  enrolmentUuid
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_ENCOUNTER_FORM_MAPPINGS: {
      return {
        ...state,
        encounterFormMappings: action.encounterFormMappings
      };
    }
    default:
      return state;
  }
}
