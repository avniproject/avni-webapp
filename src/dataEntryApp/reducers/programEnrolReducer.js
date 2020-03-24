const prefix = "app/dataEntry/reducer/enrol/";

export const types = {
  SET_ENROL_FORM: `${prefix}SET_ENROL_FORM`,
  GET_ENROL_FORM: `${prefix}GET_ENROL_FORM`
};

export const getEnrolForm = subjectTypeName => ({
  type: types.GET_ENROL_FORM,
  subjectTypeName
});

export const setEnrolForm = form => ({
  type: types.SET_ENROL_FORM,
  form
});

const initialState = {
  saved: false
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

    default:
      return state;
  }
}
