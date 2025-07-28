import { format, isValid } from "date-fns";

export const formatDate = aDate => (aDate && isValid(new Date(aDate)) ? format(new Date(aDate), "dd-MM-yyyy") : "-");
export const formatDateTime = aDate => (aDate && isValid(new Date(aDate)) ? format(new Date(aDate), "dd-MM-yyyy HH:mm") : "-");

export function getEnvVar(key, defaultValue = undefined) {
  const importMeta = globalThis.importMeta || (typeof globalThis.import !== "undefined" && globalThis.import.meta);

  if (importMeta && importMeta.env) {
    return importMeta.env[key] || defaultValue;
  }

  // Check for Vite's import.meta using a safer method
  try {
    // This will work in Vite but not cause ESLint errors
    const meta = new Function('return typeof import !== "undefined" && import.meta')();
    if (meta && meta.env) {
      return meta.env[key] || defaultValue;
    }
  } catch (e) {
    // Fall through to process.env
  }

  // In Jest/Node environments, use process.env
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || defaultValue;
  }

  return defaultValue;
}
