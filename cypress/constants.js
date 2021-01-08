export const isDevEnv = false; //process.env.OPENCHS_MODE !== "live";
export const DEV_BASE_URL = "http://localhost:6010/";
export const CI_BASE_URL = "https://staging.avniproject.org/";
export const URL = isDevEnv ? DEV_BASE_URL : CI_BASE_URL;
export const formWizardOrgUsername = "admin@form_scenarios";
export const formWizardOrgPassword = "password";
