import { isEmpty } from "lodash";
import { fetchUtils } from "react-admin";
import { authContext as _authContext } from "../../rootApp/authContext";
import { stringify } from "query-string";
import axios from "axios";
import files from "./files";
import { devEnvUserName } from "../constants";

class HttpClient {
  static instance;
  constructor() {
    if (HttpClient.instance) return HttpClient.instance;
    this.authContext = _authContext;
    this.initAuthContext = this.initAuthContext.bind(this);
    this.setHeaders = this.setHeaders.bind(this);
    this.fetchJson = this.fetchJson.bind(this);
    HttpClient.instance = this;
  }

  initAuthContext(userInfo) {
    this.authContext.init(userInfo);
    const authParams = this.authContext.get();
    if (authParams.token) axios.defaults.headers.common["AUTH-TOKEN"] = authParams.token;
  }

  initHeadersForDevEnv() {
    if (devEnvUserName) {
      axios.defaults.headers.common["user-name"] = devEnvUserName;
    }
  }

  setHeaders(options) {
    const authParams = this.authContext.get();
    if (!options.headers) options.headers = new Headers({ Accept: "application/json" });
    if (
      !options.headers.has("Content-Type") &&
      !(options.body && options.body instanceof FormData)
    ) {
      options.headers.set("Content-Type", "application/json");
    }
    if (!isEmpty(authParams)) {
      options.headers.set("user-name", authParams.username);
      if (authParams.token) options.headers.set("AUTH-TOKEN", authParams.token);
    }

    if (devEnvUserName) {
      options.headers.set("user-name", devEnvUserName);
    }
  }

  fetchJson(url, options = {}) {
    this.setHeaders(options);
    return fetchUtils.fetchJson(url, options);
  }

  async downloadFile(url, filename) {
    return await axios({
      method: "GET",
      url: url,
      responseType: "blob"
    }).then(response => {
      files.download(filename, response.data);
    });
  }

  async uploadFile(url, file) {
    const formData = new FormData();
    formData.append("file", file);
    return await axios.post(url, formData);
  }

  withParams(url, params) {
    return url + "?" + stringify(params);
  }

  async postJson(url, body) {
    return axios.post(url, body);
  }
}

export const httpClient = new HttpClient();
