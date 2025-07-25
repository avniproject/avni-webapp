import BaseIdp from "./BaseIdp";
import IdpDetails from "./IdpDetails";
import _ from "lodash";
import CognitoWebClient from "./CognitoWebClient";
import LocalStorageLocator from "../../common/utils/LocalStorageLocator";

class KeycloakWebClient extends BaseIdp {
  getAuthRequest(username, password) {
    const {
      authServerUrl,
      realm,
      clientId,
      grantType,
      scope
    } = this.idpDetails.keycloak;
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
    const token = this.getAccessToken();
    if (token) {
      if (options) {
        options.headers.set("AUTH-TOKEN", token);
      } else {
        axios.defaults.headers.common["AUTH-TOKEN"] = token;
      }
    } else {
      if (options) {
        if (options.headers.has("AUTH-TOKEN")) {
          options.headers.delete("AUTH-TOKEN");
        }
      } else {
        delete axios.defaults.headers.common["AUTH-TOKEN"];
      }
    }
    if (!options) {
      axios.defaults.withCredentials = true;
    }
  }

  setAccessToken(value) {
    localStorage.setItem(IdpDetails.AuthTokenName, value);
  }

  getAccessToken() {
    return localStorage.getItem(IdpDetails.AuthTokenName);
  }

  clearAccessToken() {
    localStorage.removeItem(IdpDetails.AuthTokenName);
  }

  get idpType() {
    return IdpDetails.keycloak;
  }

  static isAuthenticatedWithKeycloak() {
    return (
      !_.isNil(
        LocalStorageLocator.getLocalStorage().getItem(IdpDetails.AuthTokenName)
      ) && !CognitoWebClient.isAuthenticatedWithCognito()
    );
  }
}

export default KeycloakWebClient;
