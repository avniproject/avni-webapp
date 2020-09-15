const prefix = "app/dataEntry/reducer/subjectProgram/";

export const types = {
  GET_SUBJECT_PROGRAM: `${prefix}GET_SUBJECT_PROGRAM`,
  SET_SUBJECT_PROGRAM: `${prefix}SET_SUBJECT_PROGRAM`,
  UPDATE_SUBJECT_PROGRAM: `${prefix}UPDATE_SUBJECT_PROGRAM`,
  GET_PROGRAM_ENROLMENT_FORM: `${prefix}GET_PROGRAM_ENROLMENT_FORM`,
  SET_PROGRAM_ENROLMENT_FORM: `${prefix}SET_PROGRAM_ENROLMENT_FORM`,
  GET_ENCOUNTER_FORM: `${prefix}GET_ENCOUNTER_FORM`,
  SET_ENCOUNTER_FORM: `${prefix}SET_ENCOUNTER_FORM`
};

export const getSubjectProgram = subjectProgramUUID => ({
  type: types.GET_SUBJECT_PROGRAM,
  subjectProgramUUID
});

export const setSubjectProgram = subjectProgram => ({
  type: types.SET_SUBJECT_PROGRAM,
  subjectProgram
});

export const getProgramEnrolmentForm = (subjectTypeName, programName, formType) => ({
  type: types.GET_PROGRAM_ENROLMENT_FORM,
  subjectTypeName,
  programName,
  formType
});

export const setProgramEnrolmentForm = programEnrolmentForm => ({
  type: types.SET_PROGRAM_ENROLMENT_FORM,
  programEnrolmentForm
});

export const getEncounterForm = formUUID => ({
  type: types.GET_ENCOUNTER_FORM,
  formUUID
});

export const setEncounterForm = encounterForm => ({
  type: types.SET_ENCOUNTER_FORM,
  encounterForm
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_SUBJECT_PROGRAM: {
      return {
        ...state,
        subjectProgram: action.subjectProgram
      };
    }
    case types.SET_PROGRAM_ENROLMENT_FORM: {
      return {
        ...state,
        programEnrolmentForm: action.programEnrolmentForm
      };
    }
    case types.SET_ENCOUNTER_FORM: {
      const previousForms = state.encounterForms || [];
      return {
        ...state,
        encounterForms: [...previousForms, action.encounterForm]
      };
    }

    default:
      return state;
  }
}
