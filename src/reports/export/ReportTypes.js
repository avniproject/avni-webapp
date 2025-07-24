import { findKey, map } from "lodash";

export const reportTypes = Object.freeze({
  Registration: "Registration",
  Enrolment: "Enrolment",
  Encounter: "Encounter",
  GroupSubject: "Group Subject"
});

export default class ReportTypes {
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
