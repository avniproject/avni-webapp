import { find, defaultTo } from "lodash";

export const findOrDefault = (collection, predicate, defaultValue) => {
  const value = find(collection, predicate);
  return defaultTo(value, defaultValue);
};
