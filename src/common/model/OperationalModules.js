import _ from "lodash";

class OperationalModules {
  static isLoaded(operationalModules) {
    return !_.isNil(_.get(operationalModules, "subjectTypes"));
  }

  static findSubjectTypeName(operationalModules, uuid) {
    return _.get(_.find(_.get(operationalModules, "subjectTypes"), { uuid }), "name");
  }

  static findProgramName(operationalModules, uuid) {
    return _.get(_.find(_.get(operationalModules, "programs"), { uuid }), "name");
  }

  static findEncounterTypeName(operationalModules, uuid) {
    return _.get(_.find(_.get(operationalModules, "encounterTypes"), { uuid }), "name");
  }
}

export default OperationalModules;
