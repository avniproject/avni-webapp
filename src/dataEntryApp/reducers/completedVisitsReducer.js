const prefix = "app/dataEntry/reducer/completedVisit";

export const types = {
  SET_COMPLETED_VISITS: `${prefix}SET_COMPLETED_VISITS`,
  GET_COMPLETED_PROGRAM_ENCOUNTERS: `${prefix}GET_COMPLETED_PROGRAM_ENCOUNTERS`,
  GET_COMPLETED_ENCOUNTERS: `${prefix}GET_COMPLETED_ENCOUNTERS`,
  SET_ENCOUNTER_TYPES: `${prefix}SET_ENCOUNTER_TYPES`,
  LOAD_PROGRAM_ENCOUNTERS: `${prefix}LOAD_PROGRAM_ENCOUNTERS`,
  LOAD_ENCOUNTERS: `${prefix}LOAD_ENCOUNTERS`
};

export const getCompletedProgramEncounters = (enrolmentUuid, filterQueryString) => ({
  type: types.GET_COMPLETED_PROGRAM_ENCOUNTERS,
  enrolmentUuid,
  filterQueryString
});

export const getCompletedEncounters = (subjectUuid, filterQueryString) => ({
  type: types.GET_COMPLETED_ENCOUNTERS,
  subjectUuid,
  filterQueryString
});

export const loadProgramEncounters = (enrolmentUuid, filterQueryString) => ({
  type: types.LOAD_PROGRAM_ENCOUNTERS,
  enrolmentUuid,
  filterQueryString
});

export const loadEncounters = subjectUuid => ({
  type: types.LOAD_ENCOUNTERS,
  subjectUuid
});

export const setCompletedVisits = completedVisit => ({
  type: types.SET_COMPLETED_VISITS,
  completedVisit
});

export const setEncounterTypes = encounterTypes => ({
  type: types.SET_ENCOUNTER_TYPES,
  encounterTypes
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_COMPLETED_VISITS: {
      return {
        ...state,
        completedVisits: action.completedVisit
      };
    }
    case types.SET_ENCOUNTER_TYPES: {
      return {
        ...state,
        encounterTypes: action.encounterTypes
      };
    }
    default:
      return state;
  }
}
