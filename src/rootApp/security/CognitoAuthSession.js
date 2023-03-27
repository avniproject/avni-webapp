class CognitoAuthSession {
  static AuthStates = {
    SignedIn: "signedIn"
  };

  constructor(idpType, authState, authData) {
    this.idpType = idpType;
    this.authState = authState;
    this.jwtToken = authData.signInUserSession.idToken.jwtToken;
    this.username = authData.username;
  }

  userInfoUpdate(roles, updatedUsername, name) {
    this.roles = roles;
    this.username = this.username || updatedUsername;
    this.name = name;
  }

  roles;
  name;
  authState;
  username;
  jwtToken;
  idpType;
}

export default CognitoAuthSession;
