import BaseAuthSession from "./BaseAuthSession";

class KeycloakAuthSession extends BaseAuthSession {
  constructor(authState) {
    super();
    this.authState = authState;
  }
}

export default KeycloakAuthSession;
