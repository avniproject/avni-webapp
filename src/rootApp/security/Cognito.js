import Auth from "@aws-amplify/auth";
import BaseIdp from "./BaseIdp";
import IdpDetails from "./IdpDetails";

async function getToken() {
  const currentSession = await Auth.currentSession();
  return currentSession["idToken"].jwtToken;
}

class Cognito extends BaseIdp {
  async updateRequestWithSession(options, axios) {
    if (options) {
      options.headers.set("AUTH-TOKEN", await getToken());
    } else {
      axios.defaults.headers.common["AUTH-TOKEN"] = await getToken();
      axios.defaults.withCredentials = true;
    }
  }

  async getToken() {
    const currentSession = await Auth.currentSession();
    return `AUTH-TOKEN=${currentSession["idToken"].jwtToken}`;
  }

  get idpType() {
    return IdpDetails.cognito;
  }
}

export default Cognito;
