export const ArchivalConfigReducer = (state, action) => {
  switch (action.type) {
    case "sqlQuery":
      return { ...state, sqlQuery: action.payload.value };
    case "realmQuery":
      return { ...state, realmQuery: action.payload.value };
    case "batchSize":
      return { ...state, batchSize: action.payload.value };
    case "archivalConfig":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
