import ApplicationContext from "../ApplicationContext";

export const isDevEnv = ApplicationContext.isDevEnv();
export const isProdEnv = ApplicationContext.isProdEnv();
export const devEnvUserName = process.env.REACT_APP_DEV_ENV_USER;

//Set by testing tools like Jest
export const isTestEnv = process.env.NODE_ENV === "test";

export const AWS_REGION = "ap-south-1";

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
  URDU: "ur_IN",
  ASSAMESE: "as_IN"
});

export const datePickerModes = [
  { id: "calendar", name: "Calendar" },
  { id: "spinner", name: "Spinner" }
];
export const timePickerModes = [{ id: "clock", name: "Clock" }, { id: "spinner", name: "Spinner" }];

export const pickers = [
  {
    type: "date",
    key: "datePickerMode",
    modes: datePickerModes,
    label: "Date Picker Mode",
    toolTipKey: "APP_DESIGNER_FORM_ELEMENT_DATE_PICKER_MODE"
  },
  {
    type: "time",
    key: "timePickerMode",
    modes: timePickerModes,
    label: "Time Picker Mode",
    toolTipKey: "APP_DESIGNER_FORM_ELEMENT_TIME_PICKER_MODE"
  }
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
  { id: LOCALES.URDU, name: "Urdu" },
  { id: LOCALES.ASSAMESE, name: "Assamese" }
];
