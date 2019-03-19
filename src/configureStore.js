import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from 'redux-saga';
import { formMiddleware } from 'react-admin';
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createHashHistory';

import rootReducer from "./rootReducer";
import rootSaga from "./rootSaga";

const configureStore = initialState => {
    const sagaMiddleware = createSagaMiddleware();

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(rootReducer,
        initialState,
        composeEnhancers(
            applyMiddleware(
                sagaMiddleware,
                formMiddleware,
                routerMiddleware(history),
            )
        )
    );

    sagaMiddleware.run(rootSaga);

    return store;
};

export const history = createHistory();
export const store = configureStore();
