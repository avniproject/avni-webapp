export const types = {
  SET_IAM_USER: "app/SET_IAM_USER",
  GET_USER_INFO: "app/GET_USER_INFO",
  SET_USER_INFO: "app/SET_USER_INFO",
  INIT_COMPLETE: "app/INIT_COMPLETE",
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

export const setCognitoUser = (authState, authData) => ({
  type: types.SET_IAM_USER,
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

export const logout = () => ({
  type: types.LOGOUT
});

const initialState = {
  idpDetails: undefined,
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
  organisationConfig: {}
};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_IAM_USER: {
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
          name: action.payload.name
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
