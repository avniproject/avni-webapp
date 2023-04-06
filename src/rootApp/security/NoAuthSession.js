class NoAuthSession {
  userInfoUpdate(roles, updatedUsername, name) {
    this.roles = roles;
    this.username = this.username || updatedUsername;
    this.name = name;
  }
}

export default NoAuthSession;
