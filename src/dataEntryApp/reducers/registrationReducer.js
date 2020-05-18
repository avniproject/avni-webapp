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
  SET_LOADED: `${prefix}SET_LOADED`,
  UPDATE_OBS: `${prefix}UPDATE_OBS`,
  SAVE_COMPLETE: `${prefix}SAVE_COMPLETE`,
  SAVE_COMPLETE_FALSE: `${prefix}SAVE_COMPLETE_FALSE`,
  GET_VALIDATION_RESULTS: `${prefix}GET_VALIDATION_RESULTS`,
  SET_VALIDATION_RESULTS: `${prefix}SET_VALIDATION_RESULTS`,
  SELECT_ADDRESS_LEVEL_TYPE: `${prefix}SELECT_ADDRESS_LEVEL_TYPE`
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

export const getValidationResults = () => ({
  type: types.GET_VALIDATION_RESULTS
});

const initialState = {
  saved: false,
  validationResults: [],
  selectedAddressLevelType: { id: -1, name: "" }
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
      sessionStorage.setItem("subject", JSON.stringify(subject));
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
    default:
      return state;
  }
}
