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
import { toast } from "../components/Toast";

function getCsrfToken() {
  // eslint-disable-next-line no-useless-escape
  return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

class HttpClient {
  idp;
  authSession;

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
    this.setupErrorInterceptor();
    HttpClient.instance = this;
  }

  setupErrorInterceptor() {
    // Add axios response interceptor for global error handling
    axios.interceptors.response.use(
      (response) => response, // Pass through successful responses
      (error) => {
        const handled500Response = this._handle500Error(error);
        if (handled500Response) {
          return Promise.resolve(handled500Response);
        }

        // For non-500 errors, reject normally so they can be handled by calling code
        return Promise.reject(error);
      },
    );
  }

  setIdp(idp) {
    this.idp = idp;
  }

  initAuthSession(authSession) {
    this.authSession = authSession;
  }

  _handle500Error(error, url) {
    const is500Error =
      error.response?.status === 500 || error.status === 500 || (error.message && error.message.includes("Internal Server Error"));

    if (is500Error) {
      console.warn(`Handling 500 error gracefully for ${error.config?.url || url || "unknown URL"}`);
      toast.showError("Server error. Please try again later, contact support if the issue persists.");

      // Return successful response with comprehensive empty data structure to prevent crashes
      return {
        json: [],
        data: {
          // Standard paginated API structure
          _embedded: {},
          page: {
            number: 0,
            totalElements: 0,
            size: 0,
            totalPages: 0,
          },
          // Search API specific structure
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 0,
          number: 0,
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config,
      };
    }

    return null; // Not a 500 error
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

      const handled500Response = this._handle500Error(error, url);
      if (handled500Response) {
        return Promise.resolve(handled500Response);
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
        page: responseBodyJson.page?.number || 0,
        totalCount: responseBodyJson.page?.totalElements || 0,
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
