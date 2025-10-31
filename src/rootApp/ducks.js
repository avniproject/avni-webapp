import CognitoAuthSession from "./security/CognitoAuthSession";
import { httpClient } from "../common/utils/httpClient";
import IdpDetails from "./security/IdpDetails.ts";
import KeycloakAuthSession from "./security/KeycloakAuthSession";
import _ from "lodash";
import NoAuthSession from "./security/NoAuthSession";
import { SESSION_IDLE_MINUTES } from "../common/constants";
import ApplicationContext from "../ApplicationContext";

export const types = {
  SET_AUTH_SESSION: "app/SET_AUTH_SESSION",
  GET_USER_INFO: "app/GET_USER_INFO",
  SET_USER_INFO: "app/SET_USER_INFO",
  INIT_COMPLETE: "app/INIT_COMPLETE",
  GET_ADMIN_ORGANISATIONS: "app/GET_ADMIN_ORGANISATIONS",
  SET_ADMIN_ORGANISATIONS: "app/SET_ADMIN_ORGANISATIONS",
  SET_ORGANISATION_CONFIG: "app/SET_ORGANISATION_CONFIG",
  SET_TRANSLATIONS: "app/SET_TRANSLATIONS",
  SAVE_USER_INFO: "app/SAVE_USER_INFO",
  LOGOUT: "app/LOGOUT",
  INIT_GENERIC_CONFIG: "app/INIT_GENERIC_CONFIG",
  SET_CHAT_OPEN: "app/SET_CHAT_OPEN",
};

export const getAdminOrgs = () => ({
  type: types.GET_ADMIN_ORGANISATIONS,
});

export const saveUserInfo = (userInfo) => ({
  type: types.SAVE_USER_INFO,
  userInfo,
});

export const setAdminOrgs = (organisations) => ({
  type: types.SET_ADMIN_ORGANISATIONS,
  payload: {
    organisations,
  },
});

export const setOrganisationConfig = (organisationConfig) => ({
  type: types.SET_ORGANISATION_CONFIG,
  payload: {
    organisationConfig,
  },
});

export const setAuthSession = (authState, authData, idpType) => ({
  type: types.SET_AUTH_SESSION,
  payload: {
    authState,
    authData,
    idpType,
  },
});

export const getUserInfo = () => ({
  type: types.GET_USER_INFO,
});

export const setUserInfo = (userInfo) => ({
  type: types.SET_USER_INFO,
  payload: userInfo,
});

export const sendInitComplete = () => ({
  type: types.INIT_COMPLETE,
});

export const logout = () => ({
  type: types.LOGOUT,
});

export const initGenericConfig = (genericConfig) => ({
  type: types.INIT_GENERIC_CONFIG,
  payload: genericConfig,
});

export const setChatOpen = (isChatOpen) => ({
  type: types.SET_CHAT_OPEN,
  payload: isChatOpen,
});

const initialState = {
  idpDetails: undefined,
  authSession: new NoAuthSession(),
  organisation: {
    id: undefined,
    name: undefined,
  },
  appInitialised: false,
  organisationConfig: {},
  genericConfig: {
    webAppTimeoutInMinutes: SESSION_IDLE_MINUTES,
    avniEnvironment: "development",
    copilotEnabled: false,
    avniMcpServerUrl: "http://localhost:8023",
  },
  isChatOpen: (() => {
    const hasSeenChatbot = localStorage.getItem("avni-chatbot-seen");
    return !hasSeenChatbot; // Open if user hasn't seen it before
  })(),
};

// reducer
export default function (state = initialState, action) {
  switch (action.type) {
    case types.SET_AUTH_SESSION: {
      const { authState, authData, idpType } = action.payload;

      let authSession;
      try {
        if (idpType === IdpDetails.cognito) {
          authSession = new CognitoAuthSession(authState, authData);
        } else if (idpType === IdpDetails.keycloak) {
          authSession = new KeycloakAuthSession(authState);
        }
      } catch (error) {
        authSession = null;
      }

      if (_.isNil(authSession)) {
        httpClient.initAuthSession(state.authSession);
      } else {
        httpClient.initAuthSession(authSession);
      }

      return {
        ...state,
        authSession: authSession,
      };
    }
    case types.SET_USER_INFO: {
      const newState = {
        ...state,
        organisation: {
          id: action.payload.organisationId,
          name: action.payload.organisationName,
          usernameSuffix: action.payload.usernameSuffix,
          organisationCategoryName: action.payload.organisationCategoryName,
          region: action.payload.region,
        },
        userInfo: action.payload,
      };
      newState.authSession.userInfoUpdate(action.payload.roles, action.payload.username, action.payload.name);
      return newState;
    }
    case types.INIT_COMPLETE: {
      return {
        ...state,
        appInitialised: true,
      };
    }
    case types.SET_ADMIN_ORGANISATIONS: {
      return {
        ...state,
        organisations: action.payload.organisations,
      };
    }
    case types.SET_ORGANISATION_CONFIG: {
      return {
        ...state,
        organisationConfig: action.payload.organisationConfig,
      };
    }
    case types.SET_TRANSLATIONS: {
      return {
        ...state,
        translationData: action.translations,
      };
    }
    case types.INIT_GENERIC_CONFIG: {
      ApplicationContext.setAvniEnvironment(action.payload.avniEnvironment);
      return {
        ...state,
        genericConfig: {
          webAppTimeoutInMinutes: action.payload.webAppTimeoutInMinutes,
          avniEnvironment: action.payload.avniEnvironment,
          copilotEnabled: action.payload.copilotEnabled,
          avniMcpServerUrl: action.payload.avniMcpServerUrl,
        },
      };
    }
    case types.SET_CHAT_OPEN: {
      return {
        ...state,
        isChatOpen: action.payload,
      };
    }
    default:
      if (_.get(action, "payload.error")) console.log(action.payload.error);
      return state;
  }
}
