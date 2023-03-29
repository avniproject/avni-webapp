import BaseAuthSession from "./BaseAuthSession";

class CognitoAuthSession extends BaseAuthSession {
  constructor(authState, authData) {
    super();
    this.authState = authState;
    this.jwtToken = authData["signInUserSession"].idToken.jwtToken;
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
}

export default CognitoAuthSession;
