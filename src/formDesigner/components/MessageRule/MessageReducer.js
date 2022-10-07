export const MessageReducer = (state, action) => {
  switch (action.type) {
    case "setRules":
      return { ...state, rules: action.payload };
    case "setTemplates":
      console.log("templates", action.payload);
      return { ...state, templates: action.payload };
    default:
      return state;
  }
};
