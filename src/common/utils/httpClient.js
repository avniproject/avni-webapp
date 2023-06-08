import _, { isEmpty } from "lodash";
import { fetchUtils } from "react-admin";
import { stringify } from "query-string";
import axios from "axios";
import files from "./files";
import { devEnvUserName } from "../constants";
import Auth from "@aws-amplify/auth";
import querystring from "querystring";
import IdpDetails from "../../rootApp/security/IdpDetails";

function getOtherOriginUrl(services, serviceType, url) {
  const service = _.find(services, x => x["serviceType"] === serviceType);
  return `${service["origin"]}/${url}`;
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
    this.getOrgUUID = this.getOrgUUID.bind(this);
    this.get = this._wrapAxiosMethod("get");
    this._getFromDifferentOrigin = this._wrapAxiosMethodForDifferentOrigin("get");
    this.post = this._wrapAxiosMethod("post");
    this.postToDifferentOrigin = this._wrapAxiosMethodForDifferentOrigin("post");
    this.put = this._wrapAxiosMethod("put");
    this.patch = this._wrapAxiosMethod("patch");
    this.delete = this._wrapAxiosMethod("delete");
    this.deleteFromDifferentOrigin = this._wrapAxiosMethodForDifferentOrigin("delete");
    HttpClient.instance = this;
  }

  setIdp(idp) {
    this.idp = idp;
  }

  initAuthSession(authSession) {
    this.authSession = authSession;
  }

  setOrgUuidHeader() {
    const organisationUUID = this.getOrgUUID();
    if (!isEmpty(organisationUUID)) {
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

  getOrgUUID() {
    return localStorage.getItem("ORGANISATION_UUID");
  }

  saveAuthTokenForAnalyticsApp() {
    Auth.currentSession().then(session => {
      const authToken = session.idToken.jwtToken;
      localStorage.setItem(IdpDetails.AuthTokenName, authToken);
    });
  }

  async setHeaders(options) {
    if (!options.headers) options.headers = new Headers({ Accept: "application/json" });
    if (
      !options.headers.has("Content-Type") &&
      !(options.body && options.body instanceof FormData)
    ) {
      options.headers.set("Content-Type", "application/json");
    }
    if (!isEmpty(this.authSession)) {
      options.headers.set("user-name", this.authSession.username);
      await this.setTokenAndOrgUuidHeaders(options);
    }

    if (devEnvUserName) {
      options.headers.set("user-name", devEnvUserName);
    }
    if (!isEmpty(this.getOrgUUID())) {
      options.headers.set("ORGANISATION-UUID", this.getOrgUUID());
    } else {
      options.headers.delete("ORGANISATION-UUID");
    }
    options.credentials = "include";
  }

  async fetchJson(url, options = {}, skipOrgUUIDHeader) {
    await this.setHeaders(options);
    if (skipOrgUUIDHeader) {
      options.headers.delete("ORGANISATION-UUID");
    }
    return fetchUtils.fetchJson(url, options).catch(error => {
      console.log(error.message);
      if (
        error.message.indexOf("TokenExpiredException") !== -1 &&
        this.idp.idpType === IdpDetails.keycloak
      )
        this.idp.clearAccessToken();
      throw error;
    });
  }

  async downloadFile(url, filename) {
    return await this.get(url, {
      responseType: "blob"
    }).then(response => {
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

  _wrapAxiosMethodForDifferentOrigin(methodName) {
    return async (...args) => {
      return axios[methodName](...args);
    };
  }

  _wrapAxiosMethod(methodName) {
    return async (...args) => {
      await this.setTokenAndOrgUuidHeaders();
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
    return this.get(...args).then(response => response.data);
  }

  getFromDifferentOrigin(url, serviceType) {
    const otherOriginUrl = getOtherOriginUrl(this.services, serviceType, url);
    return this._getFromDifferentOrigin(otherOriginUrl);
  }

  getPageData(embeddedResourceCollectionName, ...args) {
    return this.getData(args).then(responseBodyJson => {
      return {
        data: responseBodyJson._embedded
          ? responseBodyJson._embedded[embeddedResourceCollectionName]
          : [],
        page: responseBodyJson.page.number,
        totalCount: responseBodyJson.page.totalElements
      };
    });
  }

  postUrlEncoded(url, request) {
    const options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
    const encoded = querystring.stringify(request);
    return axios.post(url, encoded, options);
  }

  setServices(services) {
    this.services = services;
  }

  postOtherOriginJson(url, serviceType, payload) {
    const otherOriginUrl = getOtherOriginUrl(this.services, serviceType, url);
    return this.postToDifferentOrigin(otherOriginUrl, payload);
  }

  deleteOtherOriginJson(url, serviceType, payload) {
    const otherOriginUrl = getOtherOriginUrl(this.services, serviceType, url);
    return this.deleteFromDifferentOrigin(otherOriginUrl, payload);
  }
}

export const httpClient = new HttpClient();
export default httpClient;
