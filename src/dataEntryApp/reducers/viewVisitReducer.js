const prefix = "app/dataEntry/reducer/viewVisit";

export const types = {
  GET_ENCOUNTER: `${prefix}GET_ENCOUNTER`,
  SET_ENCOUNTER: `${prefix}SET_ENCOUNTER`
};

export const getEncounter = encounterUuid => ({
  type: types.GET_ENCOUNTER,
  encounterUuid
});

export const setEncounter = encounter => ({
  type: types.SET_ENCOUNTER,
  encounter
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_ENCOUNTER: {
      return {
        ...state,
        encounter: action.encounter
      };
    }
    default:
      return state;
  }
}
