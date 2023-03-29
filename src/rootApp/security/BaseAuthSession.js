class BaseAuthSession {
  static AuthStates = {
    SignedIn: "signedIn"
  };

  userInfoUpdate(roles, updatedUsername, name) {
    this.roles = roles;
    this.username = this.username || updatedUsername;
    this.name = name;
  }
}

export default BaseAuthSession;
