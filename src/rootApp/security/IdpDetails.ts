class CognitoDetails {
  poolId;
  clientId;
  region;
}

class KeycloakDetails {
  authServerUrl;
  clientId;
  grantType;
  scope;
  realm;
}

class IdpDetails {
  static cognito = "cognito";
  static keycloak = "keycloak";
  static none = "none";
  static both = "both";

  static AuthTokenName = "authToken";

  idpType;
  cognito: CognitoDetails;
  keycloak: KeycloakDetails;

  static cognitoEnabled(idpDetails) {
    return (
      idpDetails.idpType === IdpDetails.cognito ||
      idpDetails.idpType === IdpDetails.both
    );
  }
}

export default IdpDetails;
