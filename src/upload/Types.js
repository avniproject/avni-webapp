import { map, findKey } from "lodash";

const types = Object.freeze({
  locations: "Locations",
  usersAndCatchments: "Users & Catchments"
});

export default class {
  static get names() {
    return map(types, name => ({ name }));
  }
  static getName(code) {
    return types[code];
  }
  static getCode(name) {
    return findKey(types, n => name === n);
  }
}
