import ApplicationContext from "../ApplicationContext";
import { getEnvVar } from "./utils/General";

// Helper function to get the current mode/environment
function getCurrentMode() {
  // Try to get mode from various sources
  let mode;

  // Check globalThis first
  const importMeta = globalThis.importMeta || (typeof globalThis.import !== "undefined" && globalThis.import.meta);
  if (importMeta && importMeta.env && importMeta.env.MODE) {
    mode = importMeta.env.MODE;
  }

  // Try the safer method for Vite
  if (!mode) {
    try {
      const meta = new Function('return typeof import !== "undefined" && import.meta')();
      if (meta && meta.env && meta.env.MODE) {
        mode = meta.env.MODE;
      }
    } catch (e) {
      // Continue to process.env
    }
  }

  // Fallback to NODE_ENV
  if (!mode && typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
    mode = process.env.NODE_ENV;
  }

  return mode || "development";
}

export const isDevEnv = ApplicationContext.isDevEnv();
export const isProdEnv = ApplicationContext.isProdEnv();

// Environment variables with fallbacks
export const devEnvUserName = getEnvVar("VITE_REACT_APP_DEV_ENV_USER") || getEnvVar("REACT_APP_DEV_ENV_USER");

// Check for test environment - works in both Vite and Jest
export const isTestEnv = getCurrentMode() === "test" || getEnvVar("NODE_ENV") === "test" || getEnvVar("MODE") === "test";

export const AWS_REGION = "ap-south-1";
export const SESSION_IDLE_MINUTES = 20;

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
  ASSAMESE: "as_IN",
  BODO: "brx_IN",
});

export const datePickerModes = [
  { id: "calendar", name: "Calendar" },
  { id: "spinner", name: "Spinner" },
];
export const timePickerModes = [
  { id: "clock", name: "Clock" },
  { id: "spinner", name: "Spinner" },
];

export const pickers = [
  {
    type: "date",
    key: "datePickerMode",
    modes: datePickerModes,
    label: "Date Picker Mode",
    toolTipKey: "APP_DESIGNER_FORM_ELEMENT_DATE_PICKER_MODE",
  },
  {
    type: "time",
    key: "timePickerMode",
    modes: timePickerModes,
    label: "Time Picker Mode",
    toolTipKey: "APP_DESIGNER_FORM_ELEMENT_TIME_PICKER_MODE",
  },
];

// export const phoneCountryPrefix = import.meta.env.VITE_REACT_APP_PHONE_COUNTRY_PREFIX || "+91";

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
  { id: LOCALES.ASSAMESE, name: "Assamese" },
  { id: LOCALES.BODO, name: "Bodo" },
];
