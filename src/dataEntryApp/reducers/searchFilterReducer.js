const prefix = "app/dataEntry/reducer/searchFilter/";

export const SEARCH_REQUEST_SESSION_STORAGE_KEY = "avni_search_request";

export const types = {
  ADD_SEARCH_REQUEST: `${prefix}ADD_SEARCH_REQUEST`,
};

const getInitialState = () => {
  const defaultRequest = {
    includeVoided: false,
    includeDisplayCount: false,
  };

  try {
    if (typeof window !== "undefined") {
      const savedRequest = sessionStorage.getItem(SEARCH_REQUEST_SESSION_STORAGE_KEY);

      if (savedRequest) {
        return { request: JSON.parse(savedRequest) };
      }
    }
  } catch (error) {
    console.error("Failed to restore search request:", error);
  }

  return { request: defaultRequest };
};

export default function (state = getInitialState(), action) {
  switch (action.type) {
    case types.ADD_SEARCH_REQUEST: {
      return {
        ...state,
        request: action.value,
      };
    }
    default:
      return state;
  }
}
