export const types = {
  INIT_COGNITO: "app/INIT_COGNITO",
  SET_COGNITO_USER: "app/SET_COGNITO_USER",
  GET_USER_INFO: "app/GET_USER_INFO",
  SET_USER_INFO: "app/SET_USER_INFO",
  INIT_COMPLETE: "app/INIT_COMPLETE",
  AUTH_CONFIGURED: "app/AUTH_CONFIGURED",
  GET_ADMIN_ORGANISATIONS: "app/GET_ADMIN_ORGANISATIONS",
  SET_ADMIN_ORGANISATIONS: "app/SET_ADMIN_ORGANISATIONS",
  SET_ORGANISATION_CONFIG: "app/SET_ORGANISATION_CONFIG",
  SET_TRANSLATIONS: "app/SET_TRANSLATIONS",
  SAVE_USER_INFO: "app/SAVE_USER_INFO",
  LOGOUT: "app/LOGOUT"
};

export const getAdminOrgs = () => ({
  type: types.GET_ADMIN_ORGANISATIONS
});

export const saveUserInfo = userInfo => ({
  type: types.SAVE_USER_INFO,
  userInfo
});

export const setAdminOrgs = organisations => ({
  type: types.SET_ADMIN_ORGANISATIONS,
  payload: {
    organisations
  }
});

export const setOrganisationConfig = organisationConfig => ({
  type: types.SET_ORGANISATION_CONFIG,
  payload: {
    organisationConfig
  }
});

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

export const setTranslations = translations => ({
  type: types.SET_TRANSLATIONS,
  translations
});

export const logout = () => ({
  type: types.LOGOUT
});

const initialState = {
  authConfigured: false,
  user: {
    authState: undefined,
    cognito: undefined,
    username: undefined,
    roles: undefined,
    privileges: []
  },
  organisation: {
    id: undefined,
    name: undefined
  },
  appInitialised: false,
  organisationConfig: {}
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
          roles: action.payload.roles,
          name: action.payload.name,
          privileges: action.payload.privileges
        },
        organisation: {
          id: action.payload.organisationId,
          name: action.payload.organisationName,
          usernameSuffix: action.payload.usernameSuffix
        },
        userInfo: action.payload
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
    case types.SET_ADMIN_ORGANISATIONS: {
      return {
        ...state,
        organisations: action.payload.organisations
      };
    }
    case types.SET_ORGANISATION_CONFIG: {
      return {
        ...state,
        organisationConfig: action.payload.organisationConfig
      };
    }
    case types.SET_TRANSLATIONS: {
      return {
        ...state,
        translationData: action.translations
      };
    }
    default:
      return state;
  }
}
