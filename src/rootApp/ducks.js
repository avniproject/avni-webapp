export const types = {
  INIT_COGNITO: "app/INIT_COGNITO",
  SET_COGNITO_USER: "app/SET_COGNITO_USER",
  GET_USER_INFO: "app/GET_USER_INFO",
  SET_USER_INFO: "app/SET_USER_INFO",
  INIT_COMPLETE: "app/INIT_COMPLETE",
  FETCH_ALL_LOCATIONS: "app/FETCH_ALL_LOCATIONS",
  FETCH_ALL_LOCATIONS_SUCCESS: "app/FETCH_ALL_LOCATIONS_SUCCESS",
  AUTH_CONFIGURED: "app/AUTH_CONFIGURED",
  SET_SUBJECTS: "app/SET_SUBJECTS",
  SEARCH_SUBJECTS: "app/SEARCH_SUBJECTS",
  SET_SUBJECT_SEARCH_PARAMS: "app/SET_SUBJECT_SEARCH_PARAMS",
  SET_REGISTRATION_SUBJECT_TYPE: "app/SET_REGISTRATION_SUBJECT_TYPE",
  GET_OPERATIONAL_MODULES: "app/GET_OPERATIONAL_MODULES",
  SET_OPERATIONAL_MODULES: "app/SET_OPERATIONAL_MODULES",
  GET_REGISTRATION_FORM: "app/GET_REGISTRATION_FORM",
  SET_REGISTRATION_FORM: "app/SET_REGISTRATION_FORM"
};

export const initCognito = () => ({
  type: types.INIT_COGNITO
});

export const setCognitoUser = (authState, authData) => ({
  type: types.SET_COGNITO_USER,
  payload: {
    authState,
    authData
  }
});

export const getUserInfo = () => ({
  type: types.GET_USER_INFO
});

export const setUserInfo = userInfo => ({
  type: types.SET_USER_INFO,
  payload: userInfo
});

export const sendInitComplete = () => ({
  type: types.INIT_COMPLETE
});

export const sendAuthConfigured = () => ({
  type: types.AUTH_CONFIGURED
});

export const setSubjects = subjects => ({
  type: types.SET_SUBJECTS,
  subjects
});

export const searchSubjects = () => ({
  type: types.SEARCH_SUBJECTS
});

export const setSubjectSearchParams = params => ({
  type: types.SET_SUBJECT_SEARCH_PARAMS,
  params
});

export const setRegistrationSubjectType = subjectType => ({
  type: types.SET_REGISTRATION_SUBJECT_TYPE,
  subjectType
});

export const getOperationalModules = () => ({
  type: types.GET_OPERATIONAL_MODULES
});
export const setOperationalModules = operationalModules => ({
  type: types.SET_OPERATIONAL_MODULES,
  operationalModules
});

export const getRegistrationForm = () => ({
  type: types.GET_REGISTRATION_FORM
});
export const setRegistrationForm = form => ({
  type: types.SET_REGISTRATION_FORM,
  form
});
const initialState = {
  authConfigured: false,
  user: {
    authState: undefined,
    cognito: undefined,
    username: undefined,
    roles: undefined
  },
  organisation: {
    id: undefined,
    name: undefined
  },
  appInitialised: false,
  subjects: [],
  subjectSearchParams: {},
  registrationSubjectType: {
    name: "Individual",
    uuid: undefined
  },
  operationalModules: {
    subjectTypes: [{ operationalSubjectTypeName: "", name: "" }],
    forms: []
  }
};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_COGNITO_USER: {
      return {
        ...state,
        user: {
          authState: action.payload.authState,
          cognito: action.payload.authData,
          username: action.payload.authData.username
        }
      };
    }
    case types.SET_USER_INFO: {
      return {
        ...state,
        user: {
          ...state.user,
          username: state.user.username || action.payload.username,
          roles: action.payload.roles
        },
        organisation: {
          id: action.payload.organisationId,
          name: action.payload.organisationName,
          usernameSuffix: action.payload.usernameSuffix
        }
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
    case types.INIT_COMPLETE: {
      return {
        ...state,
        appInitialised: true
      };
    }
    case types.AUTH_CONFIGURED: {
      return {
        ...state,
        authConfigured: true
      };
    }
    case types.SET_SUBJECTS: {
      return {
        ...state,
        subjects: action.subjects
      };
    }
    case types.SET_SUBJECT_SEARCH_PARAMS: {
      return {
        ...state,
        subjectSearchParams: {
          ...state.subjectSearchParams,
          ...action.params
        }
      };
    }
    case types.SET_OPERATIONAL_MODULES: {
      return {
        ...state,
        operationalModules: action.operationalModules
      };
    }
    case types.SET_REGISTRATION_FORM: {
      return {
        ...state,
        registrationForm: action.form
      };
    }
    default:
      return state;
  }
}
