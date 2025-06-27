import BaseAuthSession from "./BaseAuthSession";

class CognitoAuthSession extends BaseAuthSession {
  constructor(authState, authData) {
    super();
    this.authState = authState;
    this.username = authData.username;
  }

  roles;
  name;
  authState;
  username;
}

export default CognitoAuthSession;
