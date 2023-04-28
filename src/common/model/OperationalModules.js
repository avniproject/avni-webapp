import _ from "lodash";

class OperationalModules {
  static isLoaded(operationalModules) {
    return !_.isNil(_.get(operationalModules, "subjectTypes"));
  }
}

export default OperationalModules;
