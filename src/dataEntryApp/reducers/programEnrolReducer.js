import { fetchRulesResponse } from "dataEntryApp/reducers/serverSideRulesReducer";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";

const prefix = "app/dataEntry/reducer/enrol/";

export const types = {
  ON_LOAD: `${prefix}ON_LOAD`,
  UNDO_EXIT_ENROLMENT: `${prefix}UNDO_EXIT_ENROLMENT`,
  SAVE_PROGRAM_ENROLMENT: `${prefix}SAVE_PROGRAM_ENROLMENT`,
  UPDATE_OBS: `${prefix}UPDATE_OBS`,
  UPDATE_EXIT_OBS: `${prefix}UPDATE_EXIT_OBS`,
  SAVE_PROGRAM_COMPLETE: `${prefix}SAVE_PROGRAM_COMPLETE`,
  SET_PROGRAM_ENROLMENT: `${prefix}SET_PROGRAM_ENROLMENT`,
  SET_INITIAL_STATE: `${prefix}SET_INITIAL_STATE`,
  SET_LOADED: `${prefix}SET_LOADED`,
  ON_LOAD_SUCCESS: `${prefix}ON_LOAD_SUCCESS`,
  SET_VALIDATION_RESULTS: `${prefix}SET_VALIDATION_RESULTS`,
  ON_NEXT: `${prefix}ON_NEXT`,
  ON_PREVIOUS: `${prefix}ON_PREVIOUS`,
  SET_STATE: `${prefix}SET_STATE`,
  SET_FILTERED_FORM_ELEMENTS: `${prefix}SET_FILTERED_FORM_ELEMENTS`,
  SET_ENROLMENT_DATE: `${prefix}SET_ENROLMENT_DATE`,
  SET_EXIT_DATE: `${prefix}SET_EXIT_DATE`,
  ADD_NEW_QG: `${prefix}ADD_NEW_QG`,
  REMOVE_QG: `${prefix}REMOVE_QG`
};

export const setProgramEnrolment = programEnrolment => ({
  type: types.SET_PROGRAM_ENROLMENT,
  programEnrolment
});

export const onLoadSuccess = (
  programEnrolment,
  enrolForm,
  formElementGroup,
  filteredFormElements,
  onSummaryPage,
  wizard,
  isFormEmpty,
  identifierAssignments
) => ({
  type: types.ON_LOAD_SUCCESS,
  programEnrolment,
  enrolForm,
  formElementGroup,
  filteredFormElements,
  onSummaryPage,
  wizard,
  isFormEmpty,
  identifierAssignments
});

export const saveProgramEnrolment = isExit => ({
  type: types.SAVE_PROGRAM_ENROLMENT,
  isExit
});

export const onLoad = (subjectTypeName, programName, formType, programEnrolmentUuid, subjectUuid) => ({
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

export const updateObs = (formElement, value, childFormElement, questionGroupIndex) => ({
  type: types.UPDATE_OBS,
  formElement,
  value,
  childFormElement,
  questionGroupIndex
});

export const updateExitObs = (formElement, value) => ({
  type: types.UPDATE_EXIT_OBS,
  formElement,
  value
});

export const addNewQuestionGroup = formElement => ({
  type: types.ADD_NEW_QG,
  formElement
});

export const removeQuestionGroup = (formElement, questionGroupIndex) => ({
  type: types.REMOVE_QG,
  formElement,
  questionGroupIndex
});

export const saveProgramComplete = () => ({
  type: types.SAVE_PROGRAM_COMPLETE
});

export const setInitialState = () => ({
  type: types.SET_INITIAL_STATE
});

export const setLoaded = () => ({
  type: types.SET_LOADED
});

export const setValidationResults = validationResults => ({
  type: types.SET_VALIDATION_RESULTS,
  validationResults
});

export const onNext = isExit => ({
  type: types.ON_NEXT,
  isExit
});

export const onPrevious = isExit => ({
  type: types.ON_PREVIOUS,
  isExit
});

export const setState = state => ({
  type: types.SET_STATE,
  state
});

export const setFilteredFormElements = filteredFormElements => ({
  type: types.SET_FILTERED_FORM_ELEMENTS,
  filteredFormElements
});

export const setEnrolmentDate = enrolmentDate => ({
  type: types.SET_ENROLMENT_DATE,
  enrolmentDate
});

export const setExitDate = exitDate => ({
  type: types.SET_EXIT_DATE,
  exitDate
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
export const selectEnrolmentForm = state => selectProgramEnrolmentState(state).enrolForm;
export const selectIdentifierAssignments = state => selectProgramEnrolmentState(state).identifierAssignments;

const initialState = {
  saved: false,
  validationResults: [],
  load: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_INITIAL_STATE: {
      return { ...initialState, validationResults: [] };
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
        onSummaryPage: action.onSummaryPage,
        wizard: action.wizard,
        isFormEmpty: action.isFormEmpty,
        identifierAssignments: action.identifierAssignments,
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
    case types.SET_ENROLMENT_DATE: {
      const programEnrolment = state.programEnrolment.cloneForEdit();
      programEnrolment.enrolmentDateTime = action.enrolmentDate;
      const validationResults = commonFormUtil.handleValidationResult(programEnrolment.validateEnrolment(), state.validationResults);

      return {
        ...state,
        programEnrolment,
        validationResults
      };
    }
    case types.SET_EXIT_DATE: {
      const programEnrolment = state.programEnrolment.cloneForEdit();
      programEnrolment.programExitDateTime = action.exitDate;
      const validationResults = commonFormUtil.handleValidationResult(programEnrolment.validateExit(), state.validationResults);

      return {
        ...state,
        programEnrolment,
        validationResults
      };
    }
    default:
      return state;
  }
};

// reducer
export default reducer;
