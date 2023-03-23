class CognitoDetails {
  poolId;
  clientId;
}

class KeycloakDetails {
  authServerUrl;
  clientId;
  grantType;
  scope;
}

class IdpDetails {
  static cognito = "cognito";
  static keycloak = "keycloak";
  static none = "none";
  static both = "both";

  idpType;
  cognito: CognitoDetails;
  keycloak: KeycloakDetails;

  static cognitoEnabled(idpDetails) {
    return idpDetails.idpType === IdpDetails.cognito || idpDetails.idpType === IdpDetails.both;
  }
}

export default IdpDetails;
