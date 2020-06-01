import { map, filter, includes } from "lodash";

const types = Object.freeze({
  Person: "Person",
  Individual: "Individual",
  Group: "Group",
  Household: "Household"
});

export default class {
  static get types() {
    return map(types, type => ({ type }));
  }

  static get groupMemberTypes() {
    return filter(types, type => includes([types.Person, types.Individual], type));
  }

  static get householdMemberTypes() {
    return filter(types, type => type === types.Person);
  }

  static getType(name) {
    return types[name];
  }

  static isGroup(name) {
    return includes([types.Group, types.Household], name);
  }

  static isHousehold(name) {
    return types.Household === name;
  }
}
