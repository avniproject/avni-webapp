import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from 'redux-saga';
import { formMiddleware } from 'react-admin';

import rootReducer from "./rootReducer";
import rootSaga from "./rootSaga";

export default (initialState={}) => {
    const sagaMiddleware = createSagaMiddleware();

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(rootReducer,
        initialState,
        composeEnhancers(
            applyMiddleware(
                sagaMiddleware,
                formMiddleware
            )
        )
    );

    sagaMiddleware.run(rootSaga);

    return store;
}
