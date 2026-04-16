export const CustomCardConfigReducerKeys = {
  name: "name",
  dataRule: "dataRule",
  htmlFileS3Key: "htmlFileS3Key",
  setData: "setData",
};

export const initialCustomCardConfigState = {
  uuid: null,
  name: "",
  htmlFileS3Key: "",
  dataRule: "",
  voided: false,
};

export const CustomCardConfigReducer = (state, action) => {
  switch (action.type) {
    case CustomCardConfigReducerKeys.name:
      return { ...state, name: action.payload };
    case CustomCardConfigReducerKeys.dataRule:
      return { ...state, dataRule: action.payload };
    case CustomCardConfigReducerKeys.htmlFileS3Key:
      return { ...state, htmlFileS3Key: action.payload };
    case CustomCardConfigReducerKeys.setData:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
