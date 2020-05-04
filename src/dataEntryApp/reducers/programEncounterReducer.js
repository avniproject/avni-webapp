const prefix = "app/dataEntry/reducer/programEncounter/";

export const types = {
  //to get planned program encounters using enrolment uuid
  GET_PROGRAM_ENROLMENT: `${prefix}GET_PROGRAM_ENROLMENT`,
  SET_PROGRAM_ENROLMENT: `${prefix}SET_PROGRAM_ENROLMENT`,
  //to get unpanned program encounter using pprorogram uuid
  GET_UNPLAN_PROGRAM_ENCOUNTERS: `${prefix}GET_UNPLAN_PROGRAM_ENCOUNTERS`,
  SET_UNPLAN_PROGRAM_ENCOUNTERS: `${prefix}SET_UNPLAN_PROGRAM_ENCOUNTERS`,

  GET_PROGRAM_ENCOUNTER_FORM: `${prefix}GET_PROGRAM_ENCOUNTER_FORM`,
  SET_PROGRAM_ENCOUNTER_FORM: `${prefix}SET_PROGRAM_ENCOUNTER_FORM`,
  // GET_PROGRAM_ENCOUNTER: `${prefix}GET_PROGRAM_ENCOUNTER`,
  SET_PROGRAM_ENCOUNTER: `${prefix}SET_PROGRAM_ENCOUNTER`,
  SAVE_PROGRAM_ENCOUNTER: `${prefix}SAVE_PROGRAM_ENCOUNTER`,
  UPDATE_OBS: `${prefix}UPDATE_OBS`,
  //To set Save
  SAVE_PROGRAM_ENCOUNTER_COMPLETE: `${prefix}SAVE_PROGRAM_ENCOUNTER_COMPLETE`,
  //To update program encounter field
  UPDATE_PROGRAM_ENCOUNTER: `${prefix}UPDATE_PROGRAM_ENCOUNTER`,
  //for form validations
  SET_VALIDATION_RESULTS: `${prefix}SET_VALIDATION_RESULTS`
};

export const getUnplanProgramEncounters = (subjectTypeName, programUuid) => ({
  type: types.GET_UNPLAN_PROGRAM_ENCOUNTERS,
  subjectTypeName,
  programUuid
});

export const setUnplanProgramEncounters = unplanProgramEncounters => ({
  type: types.SET_UNPLAN_PROGRAM_ENCOUNTERS,
  unplanProgramEncounters
});

export const getProgramEnrolment = enrolmentUuid => ({
  type: types.GET_PROGRAM_ENROLMENT,
  enrolmentUuid
});

export const setProgramEnrolment = programEnrolment => ({
  type: types.SET_PROGRAM_ENROLMENT,
  programEnrolment
});

export const getProgramEncounterForm = (encounterTypeUuid, enrolmentUuid) => ({
  type: types.GET_PROGRAM_ENCOUNTER_FORM,
  encounterTypeUuid,
  enrolmentUuid
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

export const saveProgramEncounter = () => ({
  type: types.SAVE_PROGRAM_ENCOUNTER
});

export const saveProgramEncounterComplete = saved => ({
  type: types.SAVE_PROGRAM_ENCOUNTER_COMPLETE,
  saved
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

const initialState = {
  saved: false,
  validationResults: []
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
        //programEncounters: action.programEncounters
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
        saved: action.saved
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
    default:
      return state;
  }
}
