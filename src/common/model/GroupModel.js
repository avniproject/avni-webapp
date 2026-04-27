class GroupModel {
  name;

  static Everyone = "Everyone";
  static Administrators = "Administrators";
  static MetabaseUsers = "Metabase Users";
  // Reserved system group whose membership controls SQLite backend activation
  // on the avni-client app. Managed via the standard UserGroups admin UI.
  static SqliteMigration = "SQLite Migration";

  static nonRemovableGroup(name) {
    return [this.Everyone, this.Administrators, this.MetabaseUsers, this.SqliteMigration].includes(name);
  }

  static isEveryoneWithAllPrivileges(group) {
    return group.name === "Everyone" && group.hasAllPrivileges;
  }

  static notEveryoneWithoutAllPrivileges(group) {
    return group.name !== "Everyone" && !group.hasAllPrivileges;
  }
}

export default GroupModel;
