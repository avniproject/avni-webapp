import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from 'redux-saga';
import { formMiddleware } from 'react-admin';
import { routerMiddleware } from 'react-router-redux';
import { createHashHistory } from 'history';

import rootReducer from "../rootReducer";
import rootSaga from "../rootSaga";

export const adminHistory = createHashHistory();

const configureStore = initialState => {
    const sagaMiddleware = createSagaMiddleware();

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(rootReducer,
        initialState,
        composeEnhancers(
            applyMiddleware(
                sagaMiddleware,
                formMiddleware,
                routerMiddleware(adminHistory),
            )
        )
    );

    sagaMiddleware.run(rootSaga);

    return store;
};

export const store = configureStore();
