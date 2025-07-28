import _ from "lodash";
import { getEnvVar } from "./common/utils/General";

const None = "none";

function compareEnvVarValue(envVar, value) {
  const envValue = getEnvVar(envVar);
  return _.lowerCase(envValue) === _.lowerCase(value);
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
    const environment = getEnvVar("VITE_REACT_APP_ENVIRONMENT");
    return _.lowerCase(environment) === "production";
  }

  static isNonProdAndNonDevEnv() {
    return this.avniEnvironment !== environments.DEVELOPMENT && this.avniEnvironment !== environments.PRODUCTION;
  }

  static setAvniEnvironment(environment) {
    this.avniEnvironment = environment;
  }

  static usingIAMServer() {
    const iamServer = getEnvVar("VITE_REACT_APP_IAM_SERVER");
    return iamServer !== None && !!iamServer;
  }

  static isTestEnvironment(env) {
    return env === environments.STAGING || env === environments.PRERELEASE;
  }
}

export default ApplicationContext;
