import IdpDetails from "./IdpDetails";
import NullIdp from "./NullIdp";
import Keycloak from "./Keycloak";
import Cognito from "./Cognito";
import UndecidedIdp from "./UndecidedIdp";

class IdpFactory {
  static createIdp(activeIdpType, idpDetails) {
    if (activeIdpType === IdpDetails.none) return new NullIdp(idpDetails);
    else if (activeIdpType === IdpDetails.keycloak) return new Keycloak(idpDetails);
    else if (activeIdpType === IdpDetails.cognito) return new Cognito(idpDetails);
    else if (activeIdpType === IdpDetails.both) return new UndecidedIdp(idpDetails);
    throw new Error(`IdpType: ${activeIdpType} is not supported`);
  }
}

export default IdpFactory;
