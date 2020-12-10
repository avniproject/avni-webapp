import { fetchRulesResponse } from "dataEntryApp/reducers/serverSideRulesReducer";

const prefix = "app/dataEntry/reducer/registration/";

export const types = {
  SET_REGISTRATION_FORM: `${prefix}SET_REGISTRATION_FORM`,
  GET_REGISTRATION_FORM: `${prefix}GET_REGISTRATION_FORM`,
  GET_SUBJECT: `${prefix}GET_SUBJECT`,
  SET_SUBJECT: `${prefix}SET_SUBJECT`,
  UPDATE_SUBJECT: `${prefix}UPDATE_NEW_SUBJECT`,
  SAVE_SUBJECT: `${prefix}SAVE_SUBJECT`,
  ON_LOAD: `${prefix}ON_LOAD`,
  ON_LOAD_EDIT: `${prefix}ON_LOAD_EDIT`,
  ON_LOAD_SUCCESS: `${prefix}ON_LOAD_SUCCESS`,
  SET_LOADED: `${prefix}SET_LOADED`,
  UPDATE_OBS: `${prefix}UPDATE_OBS`,
  SAVE_COMPLETE: `${prefix}SAVE_COMPLETE`,
  SAVE_COMPLETE_FALSE: `${prefix}SAVE_COMPLETE_FALSE`,
  SET_VALIDATION_RESULTS: `${prefix}SET_VALIDATION_RESULTS`,
  SELECT_ADDRESS_LEVEL_TYPE: `${prefix}SELECT_ADDRESS_LEVEL_TYPE`,
  SET_INITIAL_SUBJECT_STATE: `${prefix}SET_INITIAL_SUBJECT_STATE`,
  ON_NEXT: `${prefix}ON_NEXT`,
  ON_PREVIOUS: `${prefix}ON_PREVIOUS`,
  SET_STATE: `${prefix}SET_STATE`,
  SET_FILTERED_FORM_ELEMENTS: `${prefix}SET_FILTERED_FORM_ELEMENTS`,
  STATIC_PAGE_ON_NEXT: `${prefix}STATIC_PAGE_ON_NEXT`,
  ON_RESET: `${prefix}ON_RESET`
};

export const selectAddressLevelType = addressLevelType => ({
  type: types.SELECT_ADDRESS_LEVEL_TYPE,
  addressLevelType
});

export const saveSubject = () => ({
  type: types.SAVE_SUBJECT
});

export const getRegistrationForm = subjectTypeName => ({
  type: types.GET_REGISTRATION_FORM,
  subjectTypeName
});

export const setRegistrationForm = form => ({
  type: types.SET_REGISTRATION_FORM,
  form
});

export const getSubject = () => ({
  type: types.GET_SUBJECT
});

export const setSubject = subject => ({
  type: types.SET_SUBJECT,
  subject
});

export const updateSubject = (field, value) => ({
  type: types.UPDATE_SUBJECT,
  field,
  value
});

export const onLoad = subjectTypeName => ({
  type: types.ON_LOAD,
  subjectTypeName
});

export const onLoadEdit = subjectUuid => ({
  type: types.ON_LOAD_EDIT,
  subjectUuid
});

export const onLoadSuccess = (
  subject,
  registrationForm,
  formElementGroup,
  filteredFormElements,
  onSummaryPage
) => ({
  type: types.ON_LOAD_SUCCESS,
  subject,
  registrationForm,
  formElementGroup,
  filteredFormElements,
  onSummaryPage
});

export const setLoaded = () => ({
  type: types.SET_LOADED
});

export const updateObs = (formElement, value) => ({
  type: types.UPDATE_OBS,
  formElement,
  value
});

export const saveComplete = () => ({
  type: types.SAVE_COMPLETE
});

export const saveCompleteFalse = () => ({
  type: types.SAVE_COMPLETE_FALSE
});

export const setValidationResults = validationResults => ({
  type: types.SET_VALIDATION_RESULTS,
  validationResults
});

export const setInitialSubjectState = () => ({
  type: types.SET_INITIAL_SUBJECT_STATE
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

export const staticPageOnNext = () => ({
  type: types.STATIC_PAGE_ON_NEXT
});

export const onReset = () => ({
  type: types.ON_RESET
});

export const fetchRegistrationRulesResponse = () => {
  return (dispatch, getState) => {
    const state = getState();
    const individualRequestEntity = state.dataEntry.registration.subject.toResource;
    dispatch(
      fetchRulesResponse({
        individualRequestEntity,
        rule: {
          formUuid: state.dataEntry.registration.registrationForm.uuid,
          workFlowType: "Individual"
        }
      })
    );
  };
};

export const selectRegistrationState = state => state.dataEntry.registration;

const initialState = {
  saved: false,
  validationResults: [],
  selectedAddressLevelType: { id: -1, name: "" },
  loaded: false
};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_REGISTRATION_FORM: {
      return {
        ...state,
        registrationForm: action.form
      };
    }
    case types.SET_SUBJECT: {
      return {
        ...state,
        subject: action.subject
      };
    }
    case types.SET_LOADED: {
      return {
        ...state,
        loaded: true
      };
    }
    case types.UPDATE_SUBJECT: {
      const subject = state.subject.cloneForEdit();
      subject[action.field] = action.value;
      return {
        ...state,
        subject
      };
    }
    case types.SELECT_ADDRESS_LEVEL_TYPE: {
      return {
        ...state,
        selectedAddressLevelType: action.addressLevelType
      };
    }
    case types.SAVE_COMPLETE: {
      return {
        ...state,
        saved: true
      };
    }
    case types.SAVE_COMPLETE_FALSE: {
      return {
        ...state,
        saved: false
      };
    }
    case types.SET_VALIDATION_RESULTS: {
      return {
        ...state,
        validationResults: action.validationResults
      };
    }
    case types.SET_INITIAL_SUBJECT_STATE: {
      return initialState;
    }
    case types.ON_LOAD_SUCCESS: {
      return {
        ...state,
        subject: action.subject,
        formElementGroup: action.formElementGroup,
        registrationForm: action.registrationForm,
        filteredFormElements: action.filteredFormElements,
        loaded: true,
        onSummaryPage: action.onSummaryPage
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
    case types.STATIC_PAGE_ON_NEXT: {
      return {
        ...state,
        renderStaticPage: false
      };
    }
    default:
      return state;
  }
}
