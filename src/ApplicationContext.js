import _ from "lodash";

const None = "none";

function compareEnvVarValue(envVar, value) {
  return _.lowerCase(process.env[envVar]) === _.lowerCase(value);
}

const environments = {
  PRODUCTION: "prod",
  PRERELEASE: "prerelease",
  STAGING: "staging",
  DEVELOPMENT: "development"
};

class ApplicationContext {
  static avniEnvironment;

  static isDevEnv() {
    return compareEnvVarValue("REACT_APP_ENVIRONMENT", "development");
  }

  static isProdEnv() {
    // is true for all non dev (staging, prerelease etc) environments
    return _.lowerCase(process.env.REACT_APP_ENVIRONMENT) === "production";
  }

  static isNonProdAndNonDevEnv() {
    return this.avniEnvironment !== environments.DEVELOPMENT && this.avniEnvironment !== environments.PRODUCTION;
  }

  static setAvniEnvironment(environment) {
    this.avniEnvironment = environment;
  }

  static usingIAMServer() {
    return process.env.REACT_APP_IAM_SERVER !== None || process.env.REACT_APP_IAM_SERVER;
  }

  static isTestEnvironment(env) {
    return env === environments.STAGING || env === environments.PRERELEASE;
  }
}

export default ApplicationContext;
