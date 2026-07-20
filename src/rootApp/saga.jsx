import { call, put, select, take, takeLatest } from "redux-saga/effects";
import {
  getUserInfo,
  sendInitComplete,
  setAdminOrgs,
  setOrganisationConfig,
  setUserInfo,
  setIsNewImplementation,
  types,
} from "./ducks";
import { httpClient as http } from "common/utils/httpClient";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { get, isEmpty } from "lodash";
import * as Auth from "aws-amplify/auth";
import { authProvider } from "adminApp/react-admin-config/authProvider";
import {
  createAiApi,
  SESSION_STORAGE_KEY as AI_SESSION_STORAGE_KEY,
} from "../common/components/aiAssistant/api";

const api = {
  fetchUserInfo: () =>
    http.fetchJson("/web/userInfo").then((response) => response.json),
  fetchAdminOrgs: () =>
    http.fetchJson("/organisation", {}, true).then((response) => response.json),
  fetchTranslations: () =>
    http.fetchJson("/web/translations").then((response) => response.json),
  fetchOrganisationConfig: () =>
    http.fetchJson("/web/organisationConfig").then((response) => response.json),
  saveUserInfo: (userInfo) => http.post("/me", userInfo),
  logout: () => http.get("/web/logout"),
};

export function* onSetAuthSession() {
  yield take(types.SET_AUTH_SESSION);
  yield put(getUserInfo());
}

export function* saveUserInfoWatcher() {
  yield takeLatest(types.SAVE_USER_INFO, saveUserInfoWorker);
}

function* saveUserInfoWorker(action) {
  yield call(api.saveUserInfo, action.userInfo);
  yield put(setUserInfo(action.userInfo));
}

export function* userInfoWatcher() {
  yield takeLatest(types.GET_USER_INFO, setUserDetails);
}

function* setUserDetails() {
  const userDetails = yield call(api.fetchUserInfo);
  const translationData = yield call(api.fetchTranslations);

  if (userDetails.isAdmin) {
    const organisations = yield call(api.fetchAdminOrgs);
    yield put(setAdminOrgs(organisations));
  }

  yield put(setUserInfo(userDetails));

  const organisationName = get(userDetails, "organisationName", "");
  document.cookie = `IMPLEMENTATION-NAME=${encodeURIComponent(
    organisationName,
  )}; path=/; SameSite=Lax; Secure=true`;

  if (!isEmpty(organisationName)) {
    const organisationConfigResponse = yield call(api.fetchOrganisationConfig);
    yield put(
      setOrganisationConfig(
        get(organisationConfigResponse, "organisationConfig", {}),
      ),
    );
    yield put(
      setIsNewImplementation(
        organisationConfigResponse.isNewImplementation || false,
      ),
    );
  }

  const i18nInstance = i18n.use(initReactI18next).use(LanguageDetector);
  const i18nParams = {
    resources: translationData,
    fallbackLng: "en",
    lng: userDetails.settings ? userDetails.settings.locale : "en",
    debug: false,
    ns: ["translations"],
    defaultNS: "translations",
    keySeparator: false,
    nsSeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ",",
    },
    react: {
      useSuspense: false,
    },
  };
  const init = (params) => i18nInstance.init(params);
  yield call(init, i18nParams);

  yield put(sendInitComplete());
}

export function* getAdminOrgsWatcher() {
  yield takeLatest(types.GET_ADMIN_ORGANISATIONS, setAdminOrgsWorker);
}

function* setAdminOrgsWorker() {
  const organisations = yield call(api.fetchAdminOrgs);
  yield put(setAdminOrgs(organisations));
}

function* logoutWorker() {
  try {
    yield call(invalidateAiAssistantSession);
    yield call(api.logout);
    // Preserve version key to prevent false migration messages after logout
    const versionKey = localStorage.getItem("avni_app_version");
    localStorage.clear();
    if (versionKey) {
      localStorage.setItem("avni_app_version", versionKey);
    }
    clearCookies();

    yield call([authProvider, authProvider.logout], {});

    yield call([Auth, Auth.signOut]);

    window.location.href = "/";
  } catch (e) {
    console.error("Logout failed:", e);
    window.location.href = "/";
  }
}

/**
 * Tear down the Avni Autopilot AI session on logout. Deletes it server-side
 * (drops the stored auth token and workdir immediately rather than waiting
 * on the idle reaper) and clears the sessionStorage id so a subsequent
 * login in the same tab starts a fresh session instead of resuming the
 * previous user's — resuming it would replay their org's chat history and
 * bundle, and reuse their auth token on `/upload-to-avni`.
 *
 * Best-effort: a failed delete must not block logout, so failures are
 * swallowed after the storage key is cleared.
 */
function* invalidateAiAssistantSession() {
  const sessionId = sessionStorage.getItem(AI_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(AI_SESSION_STORAGE_KEY);
  if (!sessionId) return;
  try {
    const baseUrl = yield select(
      (state) => state.app?.genericConfig?.avniAi?.mcpServerUrl,
    );
    if (baseUrl) {
      yield call(createAiApi(baseUrl).deleteSession, sessionId);
    }
  } catch (e) {
    console.error("Failed to invalidate AI assistant session on logout:", e);
  }
}

function clearCookies() {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
}

export function* logoutWatcher() {
  yield takeLatest(types.LOGOUT, logoutWorker);
}
