import BaseAuthSession from "./BaseAuthSession";

class CognitoAuthSession extends BaseAuthSession {
  constructor(authState, authData) {
    super();
    this.authState = authState;
    this.jwtToken = authData["signInUserSession"].idToken.jwtToken;
    this.username = authData.username;
  }

  roles;
  name;
  authState;
  username;
  jwtToken;
}

export default CognitoAuthSession;
