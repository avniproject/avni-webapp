import BaseIdp from "./BaseIdp";

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

  setAccessToken(value) {
    localStorage.setItem("authToken", value);
  }
}

export default Keycloak;
