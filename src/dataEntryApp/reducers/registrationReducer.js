import { fetchRulesResponse } from "dataEntryApp/reducers/serverSideRulesReducer";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";

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
  SET_REGISTRATION_DATE: `${prefix}SET_REGISTRATION_DATE`,
  SET_FIRST_NAME: `${prefix}SET_FIRST_NAME`,
  SET_MIDDLE_NAME: `${prefix}SET_MIDDLE_NAME`,
  SET_LAST_NAME: `${prefix}SET_LAST_NAME`,
  SET_PROFILE_PICTURE_FILE: `${prefix}SET_PROFILE_PICTURE_FILE`,
  SET_REMOVE_PROFILE_PICTURE: `${prefix}SET_REMOVE_PROFILE_PICTURE`,
  SET_DATE_OF_BIRTH: `${prefix}SET_DATE_OF_BIRTH`,
  SET_GENDER: `${prefix}SET_GENDER`,
  SET_ADDRESS: `${prefix}SET_ADDRESS`,
  ADD_NEW_QG: `${prefix}ADD_NEW_QG`,
  REMOVE_QG: `${prefix}REMOVE_QG`
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
  onSummaryPage,
  wizard,
  isFormEmpty,
  identifierAssignments
) => ({
  type: types.ON_LOAD_SUCCESS,
  subject,
  registrationForm,
  formElementGroup,
  filteredFormElements,
  onSummaryPage,
  wizard,
  isFormEmpty,
  identifierAssignments
});

export const setLoaded = () => ({
  type: types.SET_LOADED
});

export const updateObs = (formElement, value, childFormElement, questionGroupIndex) => ({
  type: types.UPDATE_OBS,
  formElement,
  value,
  childFormElement,
  questionGroupIndex
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

export const setRegistrationDate = registrationDate => ({
  type: types.SET_REGISTRATION_DATE,
  registrationDate
});

export const setFirstName = firstName => ({
  type: types.SET_FIRST_NAME,
  firstName
});

export const setMiddleName = middleName => ({
  type: types.SET_MIDDLE_NAME,
  middleName
});

export const setLastName = lastName => ({
  type: types.SET_LAST_NAME,
  lastName
});

export const setProfilePictureFile = profilePictureFile => ({
  type: types.SET_PROFILE_PICTURE_FILE,
  profilePictureFile
});

export const setRemoveProfilePicture = removeProfilePicture => ({
  type: types.SET_REMOVE_PROFILE_PICTURE,
  removeProfilePicture
});

export const setDateOfBirth = dateOfBirth => ({
  type: types.SET_DATE_OF_BIRTH,
  dateOfBirth
});

export const setGender = gender => ({
  type: types.SET_GENDER,
  gender
});

export const setAddress = lowestAddressLevel => ({
  type: types.SET_ADDRESS,
  lowestAddressLevel
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
export const selectRegistrationForm = state => selectRegistrationState(state).registrationForm;
export const selectIdentifierAssignments = state => selectRegistrationState(state).identifierAssignments;

const initialState = {
  saved: false,
  validationResults: [],
  selectedAddressLevelType: { id: -1, name: "" },
  loaded: false,
  profilePictureFile: null,
  removeProfilePicture: false
};

// reducer
export default (state = initialState, action) => {
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
      return { ...initialState, validationResults: [] };
    }
    case types.ON_LOAD_SUCCESS: {
      return {
        ...state,
        subject: action.subject,
        formElementGroup: action.formElementGroup,
        registrationForm: action.registrationForm,
        filteredFormElements: action.filteredFormElements,
        loaded: true,
        saved: false,
        onSummaryPage: action.onSummaryPage,
        wizard: action.wizard,
        isFormEmpty: action.isFormEmpty,
        identifierAssignments: action.identifierAssignments
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
    case types.SET_REGISTRATION_DATE: {
      const subject = state.subject.cloneForEdit();
      subject.registrationDate = action.registrationDate;
      const validationResults = commonFormUtil.handleValidationResult([subject.validateRegistrationDate()], state.validationResults);
      return {
        ...state,
        subject,
        validationResults
      };
    }
    case types.SET_FIRST_NAME: {
      const subject = state.subject.cloneForEdit();
      subject.firstName = action.firstName;
      const validationResults = commonFormUtil.handleValidationResult([subject.validateFirstName()], state.validationResults);
      return {
        ...state,
        subject,
        validationResults
      };
    }
    case types.SET_MIDDLE_NAME: {
      const subject = state.subject.cloneForEdit();
      subject.middleName = action.middleName;
      const validationResults = commonFormUtil.handleValidationResult([subject.validateMiddleName()], state.validationResults);
      return {
        ...state,
        subject,
        validationResults
      };
    }
    case types.SET_LAST_NAME: {
      const subject = state.subject.cloneForEdit();
      subject.lastName = action.lastName;
      const validationResults = commonFormUtil.handleValidationResult([subject.validateLastName()], state.validationResults);
      return {
        ...state,
        subject,
        validationResults
      };
    }
    case types.SET_PROFILE_PICTURE_FILE: {
      return {
        ...state,
        profilePictureFile: action.profilePictureFile,
        removeProfilePicture: false,
        validationResults: []
      };
    }
    case types.SET_REMOVE_PROFILE_PICTURE: {
      return {
        ...state,
        profilePictureFile: action.removeProfilePicture ? null : state.profilePictureFile,
        removeProfilePicture: action.removeProfilePicture,
        validationResults: []
      };
    }
    case types.SET_DATE_OF_BIRTH: {
      const subject = state.subject.cloneForEdit();
      subject.dateOfBirth = action.dateOfBirth;
      const validationResults = commonFormUtil.handleValidationResult([subject.validateDateOfBirth()], state.validationResults);
      return {
        ...state,
        subject,
        validationResults
      };
    }
    case types.SET_GENDER: {
      const subject = state.subject.cloneForEdit();
      subject.gender = action.gender;
      const validationResults = commonFormUtil.handleValidationResult([subject.validateGender()], state.validationResults);
      return {
        ...state,
        subject,
        validationResults
      };
    }
    case types.SET_ADDRESS: {
      const subject = state.subject.cloneForEdit();
      subject.lowestAddressLevel = action.lowestAddressLevel;
      const validationResults = state.subject.subjectType.allowEmptyLocation
        ? state.validationResults
        : commonFormUtil.handleValidationResult([subject.validateAddress()], state.validationResults);
      return {
        ...state,
        subject,
        validationResults
      };
    }
    default:
      return state;
  }
};
