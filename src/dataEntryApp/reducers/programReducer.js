const prefix = "app/dataEntry/reducer/programs/";

export const types = {
  GET_PROGRAMS: `${prefix}GET_PROGRAMS`,
  SET_PROGRAMS: `${prefix}SET_PROGRAMS`,
  ON_LOAD: `${prefix}ON_LOAD`
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
