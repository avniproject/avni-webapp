import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import * as serviceWorker from './serviceWorker';
import {isDevEnv, isFauxProd} from './constants';
import './index.css';
import { App, SecureApp } from './app';
import rootReducer from './rootReducer';
import { createStore } from 'redux';
import { Provider } from 'react-redux';


const store = createStore(rootReducer,
    isDevEnv && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        { isDevEnv && !isFauxProd ? <App /> : <SecureApp /> }
      </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
