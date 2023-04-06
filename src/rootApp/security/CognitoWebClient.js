import Auth from "@aws-amplify/auth";
import BaseIdp from "./BaseIdp";
import IdpDetails from "./IdpDetails";
import _ from "lodash";
import LocalStorageLocator from "../../common/utils/LocalStorageLocator";

async function getToken() {
  const currentSession = await Auth.currentSession();
  return currentSession["idToken"].jwtToken;
}

class CognitoWebClient extends BaseIdp {
  static AuthStateLocalStorageKey = "amplify-authenticator-authState";

  async updateRequestWithSession(options, axios) {
    if (options) {
      options.headers.set("AUTH-TOKEN", await getToken());
    } else {
      axios.defaults.headers.common["AUTH-TOKEN"] = await getToken();
      axios.defaults.withCredentials = true;
    }
  }

  async getTokenParam() {
    return `AUTH-TOKEN=${await getToken()}`;
  }

  get idpType() {
    return IdpDetails.cognito;
  }

  static isAuthenticatedWithCognito() {
    return (
      !_.isNil(
        LocalStorageLocator.getLocalStorage().getItem(CognitoWebClient.AuthStateLocalStorageKey)
      ) && !_.isNil(LocalStorageLocator.getLocalStorage().getItem(IdpDetails.AuthTokenName))
    );
  }
}

export default CognitoWebClient;
