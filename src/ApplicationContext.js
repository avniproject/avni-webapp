import _ from "lodash";

const None = "none";

function compareEnvVarValue(envVar, value) {
  return _.lowerCase(process.env[envVar]) === _.lowerCase(value);
}

class ApplicationContext {
  static isDevEnv() {
    return compareEnvVarValue("REACT_APP_ENVIRONMENT", "development");
  }

  static isProdEnv() {
    return _.lowerCase(process.env.REACT_APP_ENVIRONMENT) === "production";
  }

  static usingIAMServer() {
    return process.env.REACT_APP_IAM_SERVER !== None || process.env.REACT_APP_IAM_SERVER;
  }
}

export default ApplicationContext;
