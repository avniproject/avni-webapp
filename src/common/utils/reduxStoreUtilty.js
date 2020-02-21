import { store } from "../../common/store/createStore";

export const storeDispachEvent = (type, value) => {
  store.dispatch({
    type: type,
    value: value
  });
};
