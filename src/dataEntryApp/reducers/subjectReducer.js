import { Individual } from "openchs-models";

const prefix = "app/dataEntry/reducer/subject/";

export const types = {
  SET_REGISTRATION_SUBJECT_TYPE: `${prefix}SET_REGISTRATION_SUBJECT_TYPE`,
  SET_REGISTRATION_FORM: `${prefix}SET_REGISTRATION_FORM`,
  GET_REGISTRATION_FORM: `${prefix}GET_REGISTRATION_FORM`,
  GET_NEW_SUBJECT: `${prefix}GET_NEW_SUBJECT`,
  SET_NEW_SUBJECT: `${prefix}SET_NEW_SUBJECT`,
  UPDATE_NEW_SUBJECT: `${prefix}UPDATE_NEW_SUBJECT`
};

export const getRegistrationForm = () => ({
  type: types.GET_REGISTRATION_FORM
});

export const setRegistrationForm = form => ({
  type: types.SET_REGISTRATION_FORM,
  form
});

export const setRegistrationSubjectType = subjectType => ({
  type: types.SET_REGISTRATION_SUBJECT_TYPE,
  subjectType
});

export const getNewSubject = () => ({
  type: types.GET_NEW_SUBJECT
});

export const createSubject = () => ({
  type: types.SET_NEW_SUBJECT,
  newSubject: Individual.createEmptyInstance()
});

export const updateSubject = (field, value) => ({
  type: types.UPDATE_NEW_SUBJECT,
  field,
  value
});

const initialState = {};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_REGISTRATION_FORM: {
      return {
        ...state,
        registrationForm: action.form
      };
    }
    case types.SET_REGISTRATION_SUBJECT_TYPE: {
      return {
        ...state,
        registrationSubjectType: {
          ...action.subjectType
        }
      };
    }
    case types.SET_NEW_SUBJECT: {
      return {
        ...state,
        newSubject: action.newSubject
      };
    }
    case types.UPDATE_NEW_SUBJECT: {
      const newSubject = state.newSubject.cloneForEdit();
      newSubject[action.field] = action.value;
      return {
        ...state,
        newSubject
      };
    }
    default:
      return state;
  }
}
