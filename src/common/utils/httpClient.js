import _, { isEmpty } from "lodash";
import { fetchUtils } from "react-admin";
import { stringify } from "query-string";
import axios from "axios";
import files from "./files";
import { devEnvUserName } from "../constants";
import { fetchAuthSession } from "aws-amplify/auth";
import querystring from "querystring";
import IdpDetails from "../../rootApp/security/IdpDetails";
import CurrentUserService from "../service/CurrentUserService";

function getCsrfToken() {
  // eslint-disable-next-line no-useless-escape
  return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

class HttpClient {
  idp;
  authSession;
  appContext;

  static instance;

  constructor() {
    if (HttpClient.instance) return HttpClient.instance;
    this.initAuthSession = this.initAuthSession.bind(this);
    this.setHeaders = this.setHeaders.bind(this);
    this.fetchJson = this.fetchJson.bind(this);
    this.get = this._wrapAxiosMethod("get");
    this.post = this._wrapAxiosMethod("post");
    this.put = this._wrapAxiosMethod("put");
    this.patch = this._wrapAxiosMethod("patch");
    this.delete = this._wrapAxiosMethod("delete");
    HttpClient.instance = this;
  }

  setIdp(idp) {
    this.idp = idp;
  }

  initAuthSession(authSession) {
    this.authSession = authSession;
  }

  createScopedClientForDEA() {
    return this.createScopedClient("DataEntryApp");
  }

  // Create a singleton scoped client for DataEntryApp with graceful error handling
  createScopedClient(appContext) {
    // Use singleton pattern for performance
    if (this._scopedClients && this._scopedClients[appContext]) {
      return this._scopedClients[appContext];
    }

    if (!this._scopedClients) {
      this._scopedClients = {};
    }

    // Create wrapper methods that use the main httpClient with error handling
    const methods = ["get", "post", "put", "patch", "delete", "fetchJson"];
    const scopedClient = {};

    methods.forEach((method) => {
      scopedClient[method] = async (...args) => {
        try {
          return await this[method](...args);
        } catch (error) {
          return this._handleScopedError(error, appContext);
        }
      };
    });

    // Cache the scoped client
    this._scopedClients[appContext] = scopedClient;
    return scopedClient;
  }

  _handleScopedError(error, appContext) {
    // Only handle 500 errors gracefully for DataEntryApp
    if (error.response?.status === 500 && appContext === "DataEntryApp") {
      console.warn(`DataEntryApp: Handling 500 error gracefully for ${error.config?.url}`);
      return Promise.resolve({ data: [] }); // Return empty data instead of crashing
    }
    return Promise.reject(error);
  }

  setOrgUuidHeader() {
    const organisationUUID = CurrentUserService.getImpersonatedOrgUUID();
    if (CurrentUserService.isOrganisationImpersonated()) {
      axios.defaults.headers.common["ORGANISATION-UUID"] = organisationUUID;
    } else {
      delete axios.defaults.headers.common["ORGANISATION-UUID"];
    }
  }

  initHeadersForDevEnv() {
    if (devEnvUserName) {
      axios.defaults.headers.common["user-name"] = devEnvUserName;
    }
    this.setOrgUuidHeader();
  }

  saveAuthTokenForAnalyticsApp() {
    if (this.idp?.idpType === IdpDetails.cognito) {
      fetchAuthSession().then((session) => {
        const authToken = session.tokens?.idToken?.toString();
        if (authToken) {
          localStorage.setItem(IdpDetails.AuthTokenName, authToken);
        }
      });
    }
  }

  getAuthToken() {
    return localStorage.getItem(IdpDetails.AuthTokenName);
  }

  getIdToken() {
    const keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].endsWith("idToken")) {
        return localStorage.getItem(keys[i]);
      }
    }
    return null;
  }

  async setHeaders(options) {
    if (!options.headers) options.headers = new Headers({ Accept: "application/json" });
    if (!options.headers.has("Content-Type") && !(options.body && options.body instanceof FormData)) {
      options.headers.set("Content-Type", "application/json");
    }
    if (!isEmpty(this.authSession)) {
      options.headers.set("user-name", this.authSession.username);
      await this.setTokenAndOrgUuidHeaders(options);
    }

    if (devEnvUserName) {
      options.headers.set("user-name", devEnvUserName);
    }
    if (CurrentUserService.isOrganisationImpersonated()) {
      options.headers.set("ORGANISATION-UUID", CurrentUserService.getImpersonatedOrgUUID());
    } else {
      options.headers.delete("ORGANISATION-UUID");
    }
    options.credentials = "include";
    const csrfToken = getCsrfToken();
    if (!_.isEmpty(csrfToken)) options.headers.set("X-XSRF-TOKEN", csrfToken);
  }

  async fetchJson(url, options = {}, skipOrgUUIDHeader) {
    await this.setHeaders(options);
    if (skipOrgUUIDHeader) {
      options.headers.delete("ORGANISATION-UUID");
    }
    return fetchUtils.fetchJson(url, options).catch((error) => {
      if (error.status === 401 && this.idp.idpType === IdpDetails.keycloak) {
        this.idp.clearAccessToken();
      }
      throw error;
    });
  }

  async downloadFile(url, filename) {
    return await this.get(url, {
      responseType: "blob",
    }).then((response) => {
      files.download(filename, response.data);
    });
  }

  async uploadFile(url, file) {
    const formData = new FormData();
    formData.append("file", file);
    return await this.post(url, formData);
  }

  withParams(url, params) {
    return url + "?" + stringify(params);
  }

  async setTokenAndOrgUuidHeaders(options) {
    await this.idp.updateRequestWithSession(options, axios);
    this.setOrgUuidHeader();
  }

  _wrapAxiosMethod(methodName) {
    return async (...args) => {
      if (!isEmpty(this.authSession)) {
        const options = { headers: new Headers() };
        await this.setTokenAndOrgUuidHeaders(options);
      }
      this.setOrgUuidHeader();
      return axios[methodName](...args);
    };
  }

  async postJson(url, body) {
    return await this.post(url, body);
  }

  async putJson(url, body) {
    return await this.put(url, body);
  }

  async deleteEntity(url) {
    return await this.delete(url);
  }

  getData(...args) {
    return this.get(...args).then((response) => response.data);
  }

  getPageData(embeddedResourceCollectionName, ...args) {
    return this.getData(args).then((responseBodyJson) => {
      return {
        data: responseBodyJson._embedded ? responseBodyJson._embedded[embeddedResourceCollectionName] : [],
        page: responseBodyJson.page.number,
        totalCount: responseBodyJson.page.totalElements,
      };
    });
  }

  getAllData(embeddedResourceCollectionName, ...args) {
    return this.getData(args).then((response) => {
      return response._embedded ? response._embedded[embeddedResourceCollectionName] : [];
    });
  }

  postUrlEncoded(url, request) {
    const options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const encoded = querystring.stringify(request);
    return axios.post(url, encoded, options);
  }
}

export const httpClient = new HttpClient();
export default httpClient;
