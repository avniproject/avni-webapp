import { fetchRulesResponse } from "dataEntryApp/reducers/serverSideRulesReducer";
import { ValidationResult } from "avni-models";
import validationService from "dataEntryApp/services/ValidationService";

const prefix = "app/dataEntry/reducer/enrol/";

export const types = {
  SET_ENROL_FORM: `${prefix}SET_ENROL_FORM`,
  ON_LOAD: `${prefix}ON_LOAD`,
  UNDO_EXIT_ENROLMENT: `${prefix}UNDO_EXIT_ENROLMENT`,
  SAVE_PROGRAM_ENROLMENT: `${prefix}SAVE_PROGRAM_ENROLMENT`,
  UPDATE_OBS: `${prefix}UPDATE_OBS`,
  UPDATE_EXIT_OBS: `${prefix}UPDATE_EXIT_OBS`,
  SAVE_PROGRAM_COMPLETE: `${prefix}SAVE_PROGRAM_COMPLETE`,
  SET_PROGRAM_ENROLMENT: `${prefix}SET_PROGRAM_ENROLMENT`,
  UPDATE_PROGRAM_ENROL_DATE: `${prefix}UPDATE_PROGRAM_ENROL_DATE`,
  UPDATE_PROGRAM_EXIT_DATE: `${prefix}UPDATE_PROGRAM_EXIT_DATE`,
  SET_INITIAL_STATE: `${prefix}SET_INITIAL_STATE`,
  SET_ENROL_DATE_VALIDATION: `${prefix}SET_ENROL_DATE_VALIDATION`,
  SET_LOADED: `${prefix}SET_LOADED`,
  ON_LOAD_SUCCESS: `${prefix}ON_LOAD_SUCCESS`,
  SET_VALIDATION_RESULTS: `${prefix}SET_VALIDATION_RESULTS`,
  ON_NEXT: `${prefix}ON_NEXT`,
  ON_PREVIOUS: `${prefix}ON_PREVIOUS`,
  SET_STATE: `${prefix}SET_STATE`,
  SET_FILTERED_FORM_ELEMENTS: `${prefix}SET_FILTERED_FORM_ELEMENTS`
};

export const setProgramEnrolment = programEnrolment => ({
  type: types.SET_PROGRAM_ENROLMENT,
  programEnrolment
});

export const onLoadSuccess = (
  programEnrolment,
  enrolForm,
  formElementGroup,
  filteredFormElements
) => ({
  type: types.ON_LOAD_SUCCESS,
  programEnrolment,
  enrolForm,
  formElementGroup,
  filteredFormElements
});

export const saveProgramEnrolment = isExit => ({
  type: types.SAVE_PROGRAM_ENROLMENT,
  isExit
});

export const onLoad = (
  subjectTypeName,
  programName,
  formType,
  programEnrolmentUuid,
  subjectUuid
) => ({
  type: types.ON_LOAD,
  subjectTypeName,
  programName,
  formType,
  programEnrolmentUuid,
  subjectUuid
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

export const updateProgramEnrolDate = value => ({
  type: types.UPDATE_PROGRAM_ENROL_DATE,
  value
});

export const updateProgramExitDate = value => ({
  type: types.UPDATE_PROGRAM_EXIT_DATE,
  value
});

export const setInitialState = () => ({
  type: types.SET_INITIAL_STATE
});

export const setEnrolDateValidation = enrolDateValidation => ({
  type: types.SET_ENROL_DATE_VALIDATION,
  enrolDateValidation
});

export const setLoaded = () => ({
  type: types.SET_LOADED
});

export const setValidationResults = validationResults => ({
  type: types.SET_VALIDATION_RESULTS,
  validationResults
});

export const onNext = () => ({
  type: types.ON_NEXT
});

export const onPrevious = () => ({
  type: types.ON_PREVIOUS
});

export const setState = state => ({
  type: types.SET_STATE,
  state
});

export const setFilteredFormElements = filteredFormElements => ({
  type: types.SET_FILTERED_FORM_ELEMENTS,
  filteredFormElements
});

export const fetchEnrolmentRulesResponse = () => {
  return (dispatch, getState) => {
    const state = getState();
    const requestEntity = state.dataEntry.enrolmentReducer.programEnrolment.toResource;
    dispatch(
      fetchRulesResponse({
        programEnrolmentRequestEntity: requestEntity,
        rule: {
          formUuid: state.dataEntry.enrolmentReducer.enrolForm.uuid,
          workFlowType: "ProgramEnrolment"
        }
      })
    );
  };
};

export const selectProgramEnrolmentState = state => state.dataEntry.enrolmentReducer;

const initialState = {
  saved: false,
  enrolDateValidation: ValidationResult.successful(),
  load: false
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
      return initialState;
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
    case types.UPDATE_PROGRAM_ENROL_DATE: {
      const programEnrolment = state.programEnrolment.cloneForEdit();
      programEnrolment.enrolmentDateTime = action.value;
      const enrolDateValidation = validationService.getFirstError(
        programEnrolment.validateEnrolment()
      );
      return {
        ...state,
        programEnrolment,
        enrolDateValidation
      };
    }
    case types.UPDATE_PROGRAM_EXIT_DATE: {
      const programEnrolment = state.programEnrolment.cloneForEdit();
      programEnrolment.programExitDateTime = action.value;
      const enrolDateValidation = validationService.getFirstError(programEnrolment.validateExit());
      return {
        ...state,
        programEnrolment,
        enrolDateValidation
      };
    }
    case types.SET_ENROL_DATE_VALIDATION: {
      return {
        ...state,
        enrolDateValidation: action.enrolDateValidation
      };
    }
    case types.SET_LOADED: {
      return {
        ...state,
        load: true
      };
    }
    case types.ON_LOAD_SUCCESS: {
      return {
        ...state,
        programEnrolment: action.programEnrolment,
        enrolForm: action.enrolForm,
        formElementGroup: action.formElementGroup,
        filteredFormElements: action.filteredFormElements,
        load: true
      };
    }
    case types.SET_VALIDATION_RESULTS: {
      return {
        ...state,
        validationResults: action.validationResults
      };
    }
    case types.SET_STATE: {
      return action.state;
    }
    case types.SET_FILTERED_FORM_ELEMENTS: {
      return {
        ...state,
        filteredFormElements: action.filteredFormElements
      };
    }
    default:
      return state;
  }
}
