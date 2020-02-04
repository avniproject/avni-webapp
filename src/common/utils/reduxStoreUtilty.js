import { createStore } from "redux";
import { setDataReduxSate } from "../../common/store/commonReduxStoreReducer";

export const store = createStore(setDataReduxSate);

export const storeDispachObservations = (type, value) => {
  console.log("IN OBSERVATION");
  store.dispatch({
    type: type,
    value: value
  });
};
