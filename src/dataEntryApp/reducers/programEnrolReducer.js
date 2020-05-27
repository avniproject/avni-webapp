const prefix = "app/dataEntry/reducer/enrol/";

export const types = {
  SET_ENROL_FORM: `${prefix}SET_ENROL_FORM`,
  ON_LOAD: `${prefix}ON_LOAD`,
  UNDO_EXIT_ENROLMENT: `${prefix}UNDO_EXIT_ENROLMENT`,
  UPDATE_SUBJECT: `${prefix}UPDATE_NEW_SUBJECT`,
  SAVE_SUBJECT: `${prefix}SAVE_SUBJECT`,
  SAVE_PROGRAM_ENROLMENT: `${prefix}SAVE_PROGRAM_ENROLMENT`,
  UPDATE_OBS: `${prefix}UPDATE_OBS`,
  UPDATE_EXIT_OBS: `${prefix}UPDATE_EXIT_OBS`,
  SAVE_PROGRAM_COMPLETE: `${prefix}SAVE_PROGRAM_COMPLETE`,
  SET_PROGRAM_ENROLMENT: `${prefix}SET_PROGRAM_ENROLMENT`,
  GET_PROGRAM_ENROLMENT: `${prefix}GET_PROGRAM_ENROLMENT`,
  UPDATE_PROGRAM_ENROLMENT: `${prefix}UPDATE_PROGRAM_ENROLMENT`,
  SET_INITIAL_STATE: `${prefix}SET_INITIAL_STATE`,
  SET_ENROL_DATE_VALIDATION: `${prefix}SET_ENROL_DATE_VALIDATION`
};

export const getProgramEnrolment = programEnrolmentUuid => ({
  type: types.GET_PROGRAM_ENROLMENT,
  programEnrolmentUuid
});

export const setProgramEnrolment = programEnrolment => ({
  type: types.SET_PROGRAM_ENROLMENT,
  programEnrolment
});

export const saveSubject = () => ({
  type: types.SAVE_SUBJECT
});

export const saveProgramEnrolment = () => ({
  type: types.SAVE_PROGRAM_ENROLMENT
});

export const onLoad = (subjectTypeName, programName, formType, programEnrolmentUuid) => ({
  type: types.ON_LOAD,
  subjectTypeName,
  programName,
  formType,
  programEnrolmentUuid
});

export const undoExitEnrolment = programEnrolmentUuid => ({
  type: types.UNDO_EXIT_ENROLMENT,
  programEnrolmentUuid
});

export const setEnrolForm = form => ({
  type: types.SET_ENROL_FORM,
  form
});

export const updateObs = (formElement, value) => ({
  type: types.UPDATE_OBS,
  formElement,
  value
});

export const updateExitObs = (formElement, value) => ({
  type: types.UPDATE_EXIT_OBS,
  formElement,
  value
});

export const saveProgramComplete = () => ({
  type: types.SAVE_PROGRAM_COMPLETE
});

export const updateProgramEnrolment = (field, value) => ({
  type: types.UPDATE_PROGRAM_ENROLMENT,
  field,
  value
});

export const setInitialState = () => ({
  type: types.SET_INITIAL_STATE
});

export const setEnrolDateValidation = enrolDateValidation => ({
  type: types.SET_ENROL_DATE_VALIDATION,
  enrolDateValidation
});

const initialState = {
  saved: false,
  enrolDateValidation: []
};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_ENROL_FORM: {
      return {
        ...state,
        enrolForm: action.form
      };
    }

    case types.SET_INITIAL_STATE: {
      return {
        ...state,
        saved: false
      };
    }

    case types.SAVE_PROGRAM_COMPLETE: {
      return {
        ...state,
        saved: true
      };
    }
    case types.SET_PROGRAM_ENROLMENT: {
      return {
        ...state,
        programEnrolment: action.programEnrolment
      };
    }
    case types.UPDATE_PROGRAM_ENROLMENT: {
      const programEnrolment = state.programEnrolment.cloneForEdit();
      programEnrolment[action.field] = action.value;
      return {
        ...state,
        programEnrolment
      };
    }
    case types.SET_ENROL_DATE_VALIDATION: {
      return {
        ...state,
        enrolDateValidation: action.enrolDateValidation
      };
    }
    default:
      return state;
  }
}
