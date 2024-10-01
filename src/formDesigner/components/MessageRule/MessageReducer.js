export const MessageReducer = (state, action) => {
  switch (action.type) {
    case "setRules":
      return { ...state, rules: action.payload };
    case "setTemplates":
      return { ...state, templates: action.payload };
    case "setTemplateFetchError":
      return { ...state, templateFetchError: action.error };
    default:
      return state;
  }
};
