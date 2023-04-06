import IdpDetails from "./IdpDetails";
import NullIdp from "./NullIdp";
import KeycloakWebClient from "./KeycloakWebClient";
import CognitoWebClient from "./CognitoWebClient";
import UndecidedIdp from "./UndecidedIdp";

class IdpFactory {
  static createIdp(activeIdpType, idpDetails) {
    if (activeIdpType === IdpDetails.none) {
      return new NullIdp(idpDetails);
    } else if (
      activeIdpType === IdpDetails.keycloak ||
      (activeIdpType === IdpDetails.both && KeycloakWebClient.isAuthenticatedWithKeycloak())
    ) {
      return new KeycloakWebClient(idpDetails);
    } else if (
      activeIdpType === IdpDetails.cognito ||
      (activeIdpType === IdpDetails.both && CognitoWebClient.isAuthenticatedWithCognito())
    ) {
      return new CognitoWebClient(idpDetails);
    } else if (activeIdpType === IdpDetails.both) {
      return new UndecidedIdp(idpDetails);
    }
    throw new Error(`IdpType: ${activeIdpType} is not supported`);
  }
}

export default IdpFactory;
