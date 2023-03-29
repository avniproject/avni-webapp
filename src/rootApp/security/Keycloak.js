import BaseIdp from "./BaseIdp";
import IdpDetails from "./IdpDetails";

const authTokenName = "authToken";

class Keycloak extends BaseIdp {
  getAuthRequest(username, password) {
    const { authServerUrl, realm, clientId, grantType, scope } = this.idpDetails.keycloak;
    const url = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;
    const request = {
      client_id: clientId,
      grant_type: grantType,
      password: password,
      scope: scope,
      username: username
    };
    return [url, request];
  }

  updateRequestWithSession(options, axios) {
    if (options) {
      options.headers.set("AUTH-TOKEN", this.getAccessToken());
    } else {
      axios.defaults.headers.common["AUTH-TOKEN"] = this.getAccessToken();
      axios.defaults.withCredentials = true;
    }
  }

  setAccessToken(value) {
    localStorage.setItem(authTokenName, value);
  }

  getAccessToken() {
    return localStorage.getItem(authTokenName);
  }

  clearAccessToken() {
    localStorage.removeItem(authTokenName);
  }

  get idpType() {
    return IdpDetails.keycloak;
  }
}

export default Keycloak;
