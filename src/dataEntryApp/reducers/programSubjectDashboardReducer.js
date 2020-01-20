const prefix = "app/dataEntry/reducer/subjectProgram/";

export const types = {
  GET_SUBJECT_PROGRAM: `${prefix}GET_SUBJECT_PROGRAM`,
  SET_SUBJECT_PROGRAM: `${prefix}SET_SUBJECT_PROGRAM`
};

export const getSubjectProgram = subjectProgramUUID => ({
  type: types.GET_SUBJECT_PROGRAM,
  subjectProgramUUID
});

export const setSubjectProgram = subjectProgram => ({
  type: types.SET_SUBJECT_PROGRAM,
  subjectProgram
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_SUBJECT_PROGRAM: {
      return {
        ...state,
        subjectProgram: action.subjectProgram
      };
    }
    default:
      return state;
  }
}
