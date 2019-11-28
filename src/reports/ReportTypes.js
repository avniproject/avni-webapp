import { findKey, map } from "lodash";

const reportTypes = Object.freeze({
  Registration: "Registration only",
  All: "All"
});

export default class {
  static get names() {
    return map(reportTypes, name => ({ name }));
  }

  static getName(code) {
    return reportTypes[code];
  }

  static getCode(name) {
    return findKey(reportTypes, n => name === n);
  }
}
