import { compose, configureStore as reduxConfigureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import thunkMiddleware from "redux-thunk";
import { createHashHistory } from "history";
import { createReduxHistoryContext } from "redux-first-history";

import rootReducer from "../../rootApp/rootReducer";
import rootSaga from "../../rootApp/rootSaga";
import { types } from "../../rootApp/SagaErrorReducer";
import { isDevEnv } from "../constants";
import { isTestEnv } from "common/constants";
import {
  SEARCH_REQUEST_LOGOUT_EVENT_KEY,
  SEARCH_REQUEST_SESSION_STORAGE_KEY,
  types as searchFilterTypes,
} from "../../dataEntryApp/reducers/searchFilterReducer";

export const adminHistory = createHashHistory({ basename: "/admin" });
export const appDesignerHistory = createHashHistory({ basename: "/appdesigner" });

const {
  createReduxHistory,
  routerMiddleware: reduxHistoryMiddleware,
  routerReducer,
} = createReduxHistoryContext({
  history: adminHistory,
  reduxTravelling: true,
  savePreviousLocations: true,
});

const sagaMiddleware = createSagaMiddleware({
  onError: (error) => {
    console.error("configureStore", "saga unhandled error", error.message);
    const resetErrorCB = () => store.dispatch({ type: types.RESET_ERROR_RAISED });
    store.dispatch({
      type: types.SET_ERROR_RAISED,
      payload: { error, resetErrorCB },
    });
  },
});

const enhancedReducer = rootReducer(routerReducer);

const composeEnhancers = (isDevEnv && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

export const configureStore = (initialState = {}) => {
  const store = reduxConfigureStore({
    reducer: enhancedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        // Disable serializableCheck to allow class instances
        serializableCheck: false,
        // Disable immutableCheck to fix DEA issue
        immutableCheck: false,
      }).concat(thunkMiddleware, sagaMiddleware, reduxHistoryMiddleware),
    preloadedState: initialState,
    enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(composeEnhancers),
  });

  if (!isTestEnv) {
    sagaMiddleware.run(rootSaga);
  }

  return store;
};

export const store = configureStore();
if (!isTestEnv && typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === SEARCH_REQUEST_LOGOUT_EVENT_KEY && event.newValue) {
      try {
        sessionStorage.removeItem(SEARCH_REQUEST_SESSION_STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear saved search request:", error);
      }

      store.dispatch({
        type: searchFilterTypes.RESET_SEARCH_REQUEST,
      });
    }
  });
}
