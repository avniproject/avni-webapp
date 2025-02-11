class GroupModel {
  name;

  static Everyone = "Everyone";
  static Administrators = "Administrators";
  static MetabaseUsers = "Metabase Users";

  static nonRemovableGroup(name) {
    return [this.Everyone, this.Administrators, this.MetabaseUsers].includes(name);
  }

  static isEveryoneWithAllPrivileges(group) {
    return group.name === "Everyone" && group.hasAllPrivileges;
  }

  static notEveryoneWithoutAllPrivileges(group) {
    return group.name !== "Everyone" && !group.hasAllPrivileges;
  }
}

export default GroupModel;
