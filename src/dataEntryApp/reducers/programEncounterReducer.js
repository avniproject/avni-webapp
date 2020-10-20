import { fetchRulesResponse } from "dataEntryApp/reducers/serverSideRulesReducer";

const prefix = "app/dataEntry/reducer/programEncounter/";

export const types = {
  ON_LOAD: `${prefix}ON_LOAD`,
  SET_PROGRAM_ENROLMENT: `${prefix}SET_PROGRAM_ENROLMENT`,
  SET_UNPLAN_PROGRAM_ENCOUNTERS: `${prefix}SET_UNPLAN_PROGRAM_ENCOUNTERS`,
  SET_PROGRAM_ENCOUNTER_FORM: `${prefix}SET_PROGRAM_ENCOUNTER_FORM`,
  SET_PROGRAM_ENCOUNTER: `${prefix}SET_PROGRAM_ENCOUNTER`,
  SAVE_PROGRAM_ENCOUNTER: `${prefix}SAVE_PROGRAM_ENCOUNTER`,
  UPDATE_OBS: `${prefix}UPDATE_OBS`,
  SAVE_PROGRAM_ENCOUNTER_COMPLETE: `${prefix}SAVE_PROGRAM_ENCOUNTER_COMPLETE`,
  UPDATE_PROGRAM_ENCOUNTER: `${prefix}UPDATE_PROGRAM_ENCOUNTER`,
  SET_VALIDATION_RESULTS: `${prefix}SET_VALIDATION_RESULTS`,
  SET_ENCOUNTER_DATE_VALIDATION: `${prefix}SET_ENCOUNTER_DATE_VALIDATION`,
  RESET_STATE: `${prefix}RESET_STATE`,
  CREATE_PROGRAM_ENCOUNTER: `${prefix}CREATE_PROGRAM_ENCOUNTER`,
  CREATE_PROGRAM_ENCOUNTER_FOR_SCHEDULED: `${prefix}CREATE_PROGRAM_ENCOUNTER_FOR_SCHEDULED`,
  EDIT_PROGRAM_ENCOUNTER: `${prefix}EDIT_PROGRAM_ENCOUNTER`,
  UPDATE_CANCEL_OBS: `${prefix}UPDATE_CANCEL_OBS`,
  CREATE_CANCEL_PROGRAM_ENCOUNTER: `${prefix}CREATE_CANCEL_PROGRAM_ENCOUNTER`,
  EDIT_CANCEL_PROGRAM_ENCOUNTER: `${prefix}EDIT_CANCEL_PROGRAM_ENCOUNTER`
};

export const setUnplanProgramEncounters = unplanProgramEncounters => ({
  type: types.SET_UNPLAN_PROGRAM_ENCOUNTERS,
  unplanProgramEncounters
});

export const onLoad = enrolmentUuid => ({
  type: types.ON_LOAD,
  enrolmentUuid
});

export const setProgramEnrolment = programEnrolment => ({
  type: types.SET_PROGRAM_ENROLMENT,
  programEnrolment
});

export const setProgramEncounterForm = programEncounterForm => ({
  type: types.SET_PROGRAM_ENCOUNTER_FORM,
  programEncounterForm
});

export const setProgramEncounter = programEncounter => ({
  type: types.SET_PROGRAM_ENCOUNTER,
  programEncounter
});

export const updateObs = (formElement, value) => ({
  type: types.UPDATE_OBS,
  formElement,
  value
});

export const updateCancelObs = (formElement, value) => ({
  type: types.UPDATE_CANCEL_OBS,
  formElement,
  value
});

export const saveProgramEncounter = isCancel => ({
  type: types.SAVE_PROGRAM_ENCOUNTER,
  isCancel
});

export const saveProgramEncounterComplete = () => ({
  type: types.SAVE_PROGRAM_ENCOUNTER_COMPLETE
});

export const updateProgramEncounter = (field, value) => ({
  type: types.UPDATE_PROGRAM_ENCOUNTER,
  field,
  value
});

export const setValidationResults = validationResults => ({
  type: types.SET_VALIDATION_RESULTS,
  validationResults
});

export const setEncounterDateValidation = enconterDateValidation => ({
  type: types.SET_ENCOUNTER_DATE_VALIDATION,
  enconterDateValidation
});

export const editProgramEncounter = programEncounterUuid => ({
  type: types.EDIT_PROGRAM_ENCOUNTER,
  programEncounterUuid
});

export const resetState = () => ({
  type: types.RESET_STATE
});

export const createProgramEncounter = (encounterTypeUuid, enrolUuid) => ({
  type: types.CREATE_PROGRAM_ENCOUNTER,
  encounterTypeUuid,
  enrolUuid
});

export const createProgramEncounterForScheduled = programEncounterUuid => ({
  type: types.CREATE_PROGRAM_ENCOUNTER_FOR_SCHEDULED,
  programEncounterUuid
});

export const createCancelProgramEncounter = programEncounterUuid => ({
  type: types.CREATE_CANCEL_PROGRAM_ENCOUNTER,
  programEncounterUuid
});

export const editCancelProgramEncounter = programEncounterUuid => ({
  type: types.EDIT_CANCEL_PROGRAM_ENCOUNTER,
  programEncounterUuid
});

export const fetchProgramEncounterRulesResponse = () => {
  return (dispatch, getState) => {
    const state = getState();
    const requestEntity = state.dataEntry.programEncounterReducer.programEncounter.toResource;
    dispatch(
      fetchRulesResponse({
        programEncounterRequestEntity: requestEntity,
        rule: {
          formUuid: state.dataEntry.programEncounterReducer.programEncounterForm.uuid,
          ruleType: "VisitSchedule",
          workFlowType: "ProgramEncounter"
        }
      })
    );
  };
};

const initialState = {
  saved: false,
  validationResults: [],
  enconterDateValidation: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_PROGRAM_ENROLMENT: {
      return {
        ...state,
        programEnrolment: action.programEnrolment
      };
    }
    case types.SET_UNPLAN_PROGRAM_ENCOUNTERS: {
      return {
        ...state,
        unplanProgramEncounters: action.unplanProgramEncounters
      };
    }
    case types.SET_PROGRAM_ENCOUNTER_FORM: {
      return {
        ...state,
        programEncounterForm: action.programEncounterForm
      };
    }
    case types.SET_PROGRAM_ENCOUNTER: {
      return {
        ...state,
        programEncounter: action.programEncounter
      };
    }
    case types.SAVE_PROGRAM_ENCOUNTER_COMPLETE: {
      return {
        ...state,
        saved: true
      };
    }
    case types.UPDATE_PROGRAM_ENCOUNTER: {
      const programEncounter = state.programEncounter.cloneForEdit();
      programEncounter[action.field] = action.value;
      return {
        ...state,
        programEncounter
      };
    }
    case types.SET_VALIDATION_RESULTS: {
      return {
        ...state,
        validationResults: action.validationResults
      };
    }
    case types.SET_ENCOUNTER_DATE_VALIDATION: {
      return {
        ...state,
        enconterDateValidation: action.enconterDateValidation
      };
    }
    case types.RESET_STATE: {
      return {
        ...state,
        saved: false,
        validationResults: [],
        enconterDateValidation: [],
        programEncounter: null,
        programEncounterForm: null,
        programEnrolment: null,
        unplanProgramEncounters: null
      };
    }
    default:
      return state;
  }
}
