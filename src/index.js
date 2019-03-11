import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import createSagaMiddleware from 'redux-saga';

import './index.css';
import * as serviceWorker from './serviceWorker';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';
import { isDevEnv, cognitoInDev, isProdEnv } from './common/constants';
import { App, SecureApp } from './app';

const sagaMiddleware = createSagaMiddleware();
const reduxDevTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();


const store = createStore(rootReducer,
    compose(
        applyMiddleware(sagaMiddleware),
        isDevEnv && reduxDevTools
    )
);

sagaMiddleware.run(rootSaga);

ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        { (isProdEnv || cognitoInDev) ? <SecureApp /> : <App /> }
      </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
