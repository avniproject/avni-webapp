import _ from "lodash";

export class SubjectTypeType {
  static Person = "Person";
  static Individual = "Individual";
  static Group = "Group";
  static Household = "Household";
  static User = "User";

  static getAll() {
    return [SubjectTypeType.Person, SubjectTypeType.Individual, SubjectTypeType.Group, SubjectTypeType.Household, SubjectTypeType.User];
  }
}

export default class {
  static get groupMemberTypes() {
    return _.filter(SubjectTypeType.getAll(), type => _.includes([SubjectTypeType.Person, SubjectTypeType.Individual], type));
  }

  static get householdMemberTypes() {
    return _.filter(SubjectTypeType.getAll(), type => type === SubjectTypeType.Person);
  }

  static getType(name) {
    return _.find(SubjectTypeType.getAll(), x => x === name);
  }

  static isGroup(name) {
    return _.includes([SubjectTypeType.Group, SubjectTypeType.Household], name);
  }

  static isHousehold(name) {
    return SubjectTypeType.Household === name;
  }
}
