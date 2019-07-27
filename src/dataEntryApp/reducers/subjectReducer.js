const prefix = "app/dataEntry/reducer/subject/";

export const types = {
  SET_REGISTRATION_SUBJECT_TYPE: `${prefix}SET_REGISTRATION_SUBJECT_TYPE`,
  SET_REGISTRATION_FORM: `${prefix}SET_REGISTRATION_FORM`,
  GET_REGISTRATION_FORM: `${prefix}GET_REGISTRATION_FORM`
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
    default:
      return state;
  }
}
