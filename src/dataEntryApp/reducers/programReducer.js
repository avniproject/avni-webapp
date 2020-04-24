const prefix = "app/dataEntry/reducer/programs/";

export const types = {
  GET_PROGRAMS: `${prefix}GET_PROGRAMS`,
  SET_PROGRAMS: `${prefix}SET_PROGRAMS`,
  ON_LOAD: `${prefix}ON_LOAD`,
  GET_PROGRAM_VISITS: `${prefix}GET_PROGRAM_VISITS`,
  SET_PROGRAM_VISITS: `${prefix}SET_PROGRAM_VISITS`
};

export const getPrograms = subjectUuid => ({
  type: types.GET_PROGRAMS,
  subjectUuid
});

export const setPrograms = programs => ({
  type: types.SET_PROGRAMS,
  programs
});

export const onLoad = (subjectTypeUuid, programUuid) => ({
  type: types.ON_LOAD,
  subjectTypeUuid,
  programUuid
});

export const getProgramVisits = operationalProgramName => ({
  type: types.GET_PROGRAM_VISITS,
  operationalProgramName
});

export const setProgramVisits = programVisits => ({
  type: types.SET_PROGRAM_VISITS,
  programVisits
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_PROGRAMS: {
      return {
        ...state,
        programs: action.programs
      };
    }
    default:
      return state;
  }
}
