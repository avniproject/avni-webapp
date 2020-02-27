export const types = {
  INIT_COGNITO: "app/INIT_COGNITO",
  SET_COGNITO_USER: "app/SET_COGNITO_USER",
  GET_USER_INFO: "app/GET_USER_INFO",
  SET_USER_INFO: "app/SET_USER_INFO",
  GET_ORG_CONFIG: "app/GET_ORG_CONFIG",
  SET_ORG_CONFIG: "app/SET_ORG_CONFIG",
  INIT_COMPLETE: "app/INIT_COMPLETE",
  FETCH_ALL_LOCATIONS: "app/FETCH_ALL_LOCATIONS",
  FETCH_ALL_LOCATIONS_SUCCESS: "app/FETCH_ALL_LOCATIONS_SUCCESS",
  AUTH_CONFIGURED: "app/AUTH_CONFIGURED"
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

export const getOrgConfigInfo = () => ({
  type: types.GET_ORG_CONFIG
});

export const setOrgConfigInfo = orgConfig => ({
  type: types.SET_ORG_CONFIG,
  payload: orgConfig
});

export const sendInitComplete = () => ({
  type: types.INIT_COMPLETE
});

export const sendAuthConfigured = () => ({
  type: types.AUTH_CONFIGURED
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
  appInitialised: false
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
    case types.SET_ORG_CONFIG: {
      return {
        ...state,
        // orgConfig: action.payload._embedded.organisationConfig[0].settings.languages
        orgConfig: action.payload
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

    default:
      return state;
  }
}
