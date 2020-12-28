const prefix = "app/dataEntry/reducer/viewVisit";

export const types = {
  GET_ENCOUNTER: `${prefix}GET_ENCOUNTER`,
  SET_ENCOUNTER: `${prefix}SET_ENCOUNTER`,
  GET_PROGRAM_ENCOUNTER: `${prefix}GET_PROGRAM_ENCOUNTER`,
  SET_FORM: `${prefix}SET_FORM`
};

export const getEncounter = encounterUuid => ({
  type: types.GET_ENCOUNTER,
  encounterUuid
});

export const setEncounter = encounter => ({
  type: types.SET_ENCOUNTER,
  encounter
});

export const setForm = form => ({
  type: types.SET_FORM,
  form
});

export const getProgramEncounter = encounterUuid => ({
  type: types.GET_PROGRAM_ENCOUNTER,
  encounterUuid
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_ENCOUNTER: {
      return {
        ...state,
        encounter: action.encounter
      };
    }
    case types.SET_FORM: {
      return {
        ...state,
        form: action.form
      };
    }
    default:
      return state;
  }
}
