const prefix = "app/dataEntry/reducer/programs/";

export const types = {
  GET_PROGRAMS: `${prefix}GET_PROGRAMS`,
  SET_PROGRAMS: `${prefix}SET_PROGRAMS`,
  ON_LOAD: `${prefix}ON_LOAD`,
  GET_PROGRAM_PLANNED_VISITS: `${prefix}GET_PROGRAM_PLANNED_VISITS`,
  SET_PROGRAM_PLANNED_VISITS: `${prefix}SET_PROGRAM_PLANNED_VISITS`
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

export const getProgramPlannedVisits = enrolmentUuid => ({
  type: types.GET_PROGRAM_PLANNED_VISITS,
  enrolmentUuid
});

export const setProgramPlannedVisits = programPlannedVisits => ({
  type: types.SET_PROGRAM_PLANNED_VISITS,
  programPlannedVisits
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_PROGRAMS: {
      return {
        ...state,
        programs: action.programs
      };
    }
    case types.SET_PROGRAM_PLANNED_VISITS: {
      console.log("at state", action.programPlannedVisits);
      // console.log("state at reducer",{...state,programPlannedVisits:action.programPlannedVisits});
      return {
        ...state,
        programPlannedVisits: action.programPlannedVisits
      };
    }
    default:
      return state;
  }
}
