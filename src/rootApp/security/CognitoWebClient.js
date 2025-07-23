import { fetchAuthSession } from "aws-amplify/auth";
import BaseIdp from "./BaseIdp";
import IdpDetails from "./IdpDetails";
import _ from "lodash";
import LocalStorageLocator from "../../common/utils/LocalStorageLocator";

async function getToken() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString() || null;

  // Store token in localStorage for consistency with other IDP implementations
  if (token) {
    localStorage.setItem(IdpDetails.AuthTokenName, token);
  } else {
    localStorage.removeItem(IdpDetails.AuthTokenName);
  }

  return token;
}

class CognitoWebClient extends BaseIdp {
  static AuthStateLocalStorageKey = "amplify-authenticator-authState";

  async updateRequestWithSession(options, axios) {
    const token = await getToken();
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

  async getTokenParam() {
    const token = await getToken();
    return token ? `AUTH-TOKEN=${token}` : "";
  }

  get idpType() {
    return IdpDetails.cognito;
  }

  static isAuthenticatedWithCognito() {
    const ls = LocalStorageLocator.getLocalStorage();
    return !_.isNil(ls.getItem(CognitoWebClient.AuthStateLocalStorageKey)) && !_.isNil(ls.getItem(IdpDetails.AuthTokenName));
  }
}

export default CognitoWebClient;
