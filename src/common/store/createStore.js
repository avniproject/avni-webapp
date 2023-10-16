import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { formMiddleware } from "react-admin";
import { routerMiddleware } from "react-router-redux";
import { createHashHistory } from "history";
import thunkMiddleware from "redux-thunk";

import { isDevEnv } from "../constants";
import rootReducer from "../../rootApp/rootReducer";
import rootSaga from "../../rootApp/rootSaga";
import { isTestEnv } from "common/constants";
import { types } from "../../rootApp/SagaErrorReducer";

export const adminHistory = createHashHistory({ basename: "/admin" });
export const appDesignerHistory = createHashHistory({ basename: "/appdesigner" });

const configureStore = initialState => {
  //https://github.com/redux-saga/redux-saga/issues/1698#issuecomment-444291868
  const sagaMiddleware = createSagaMiddleware({
    onError: error => {
      console.error("configureStore", "saga unhandled error", error.message);
      const resetErrorCB = () => store.dispatch({ type: types.RESET_ERROR_RAISED });
      store.dispatch({
        type: types.SET_ERROR_RAISED,
        payload: { error, resetErrorCB }
      });
    }
  });

  const composeEnhancers = (isDevEnv && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(
        thunkMiddleware,
        sagaMiddleware,
        formMiddleware,
        routerMiddleware(adminHistory, appDesignerHistory)
      )
    )
  );

  if (!isTestEnv) {
    sagaMiddleware.run(rootSaga);
  }

  return store;
};

export const store = configureStore();
