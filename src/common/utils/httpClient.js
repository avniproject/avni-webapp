import { isEmpty } from "lodash";
import { fetchUtils } from "react-admin";
import { authContext as _authContext } from "../../rootApp/authContext";
import { stringify } from "query-string";
import axios from "axios";

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
    // options.headers.set("USER-NAME", "kalaptrusttab3@gmail.com");
    options.headers.set("USER-NAME", "ihmp-dev");
  }

  fetchJson(url, options = {}) {
    this.setHeaders(options);
    return fetchUtils.fetchJson(url, options);
  }

  withParams(url, params) {
    return url + "?" + stringify(params);
  }
}

export const httpClient = new HttpClient();
