/**
 * Ensures keyValues is always returned as an array
 * @param {Array} keyValues - The keyValues array which might be undefined
 * @returns {Array} - A safe array to work with
 */
export const safeKeyValues = keyValues => (Array.isArray(keyValues) ? keyValues : []);

/**
 * Finds a keyValue object by its key property
 * @param {Array} keyValues - Array of key-value objects
 * @param {string} key - The key to search for
 * @returns {Object|undefined} - The found keyValue object or undefined
 */
export const findKeyValue = (keyValues, key) => {
  return safeKeyValues(keyValues).find(item => item && item.key === key);
};

/**
 * Gets the value for a given key
 * @param {Array} keyValues - Array of key-value objects
 * @param {string} key - The key to search for
 * @returns {*} - The value of the found key or undefined
 */
export const getKeyValue = (keyValues, key) => {
  const found = findKeyValue(keyValues, key);
  return found ? found.value : undefined;
};
