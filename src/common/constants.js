export const isDevEnv = process.env.REACT_APP_ENVIRONMENT === "development";
export const cognitoInDev = isDevEnv && process.env.REACT_APP_COGNITO_IN_DEV === "true";
export const isProdEnv = process.env.REACT_APP_ENVIRONMENT === "production";
export const devEnvUserName = process.env.REACT_APP_DEV_ENV_USER;

export const AWS_REGION = process.env.REACT_APP_AWS_REGION || "ap-south-1";

export const cognitoConfig = {
  region: AWS_REGION,
  poolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  clientId: process.env.REACT_APP_COGNITO_APP_CLIENT_ID
};

export const ROLES = Object.freeze({
  ADMIN: "admin",
  ORG_ADMIN: "organisation_admin",
  USER: "user"
});

export const LOCALES = Object.freeze({
  ENGLISH: "en",
  HINDI: "hi_IN",
  MARATHI: "mr_IN",
  GUJARATI: "gu_IN",
  BENGALI: "be_IN",
  TELUGU: "te_IN",
  TAMIL: "ta_IN",
  KANNADA: "ka_IN",
  ODIA: "od_IN",
  MALAYALAM: "ma_IN",
  PUNJABI: "pu_IN",
  SANSKRIT: "sa_IN",
  URDU: "ur_IN"
});

export const datePickerModes = [
  { id: "calendar", name: "Calendar" },
  { id: "spinner", name: "Spinner" }
];

export const phoneCountryPrefix = process.env.REACT_APP_PHONE_COUNTRY_PREFIX || "+91";

export const localeChoices = [
  { id: LOCALES.ENGLISH, name: "English" },
  { id: LOCALES.HINDI, name: "Hindi" },
  { id: LOCALES.MARATHI, name: "Marathi" },
  { id: LOCALES.GUJARATI, name: "Gujarati" },
  { id: LOCALES.BENGALI, name: "Bengali" },
  { id: LOCALES.TELUGU, name: "Telugu" },
  { id: LOCALES.TAMIL, name: "Tamil" },
  { id: LOCALES.KANNADA, name: "Kannada" },
  { id: LOCALES.ODIA, name: "Odia" },
  { id: LOCALES.MALAYALAM, name: "Malayalam" },
  { id: LOCALES.PUNJABI, name: "Punjabi" },
  { id: LOCALES.SANSKRIT, name: "Sanskrit" },
  { id: LOCALES.URDU, name: "Urdu" }
];

export const withoutDataEntry = false;
