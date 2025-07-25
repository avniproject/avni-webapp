import _ from "lodash";

const None = "none";

function compareEnvVarValue(envVar, value) {
  return _.lowerCase(import.meta.env[envVar]) === _.lowerCase(value);
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
    return compareEnvVarValue("VITE_REACT_APP_ENVIRONMENT", "development");
  }

  static isProdEnv() {
    return _.lowerCase(import.meta.env.VITE_REACT_APP_ENVIRONMENT) === "production";
  }

  static isNonProdAndNonDevEnv() {
    return this.avniEnvironment !== environments.DEVELOPMENT && this.avniEnvironment !== environments.PRODUCTION;
  }

  static setAvniEnvironment(environment) {
    this.avniEnvironment = environment;
  }

  static usingIAMServer() {
    return import.meta.env.VITE_REACT_APP_IAM_SERVER !== None || import.meta.env.VITE_REACT_APP_IAM_SERVER;
  }

  static isTestEnvironment(env) {
    return env === environments.STAGING || env === environments.PRERELEASE;
  }
}

export default ApplicationContext;
