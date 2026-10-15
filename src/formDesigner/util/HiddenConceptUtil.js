import { filter } from "lodash";
import { findKeyValue, safeKeyValues } from "./KeyValuesUtil";

// Same key as KeyValue.HiddenKey in openchs-models (1.33.86). See avniproject/avni-product#1905.
export const HIDDEN_KEY = "hidden";

// openchs-models KeyValue.getValue() JSON-parses a string and reads anything else as it is.
const parsedValue = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// Only a parsed boolean true hides, as in openchs-models Concept.isHidden(), so the switch
// shows on exactly when the field app hides the value.
export const isHiddenKeyValues = (keyValues) => {
  const keyValue = findKeyValue(keyValues, HIDDEN_KEY);
  return keyValue !== undefined && parsedValue(keyValue.value) === true;
};

export const isConceptHidden = (concept) => isHiddenKeyValues(concept && concept.keyValues);

export const withHiddenKeyValue = (keyValues, hidden) => {
  const others = filter(safeKeyValues(keyValues), (item) => !(item && item.key === HIDDEN_KEY));
  return hidden ? [...others, { key: HIDDEN_KEY, value: true }] : others;
};
