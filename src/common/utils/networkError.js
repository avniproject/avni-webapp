const AXIOS_NETWORK_ERROR_CODES = ["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"];

const FETCH_NETWORK_ERROR_MESSAGE = /^(Failed to fetch|NetworkError when attempting to fetch resource|Load failed)/;

const AMPLIFY_NETWORK_ERROR_NAME = "NetworkError";

export const NETWORK_ERROR_MESSAGE = "Unable to reach the server. Please check your internet connection and try again.";

function isBrowserOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function isNetworkError(error) {
  if (!error) return false;
  if (isBrowserOffline()) return true;
  if (error.isAxiosError) return !error.response && AXIOS_NETWORK_ERROR_CODES.includes(error.code);
  if (error instanceof TypeError) return FETCH_NETWORK_ERROR_MESSAGE.test(error.message);
  return error.name === AMPLIFY_NETWORK_ERROR_NAME;
}
