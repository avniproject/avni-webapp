import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import * as serviceWorker from './serviceWorker';
import configureStore from './initRedux';
import { cognitoInDev, isProdEnv } from './common/constants';
import { App, SecureApp } from './app';

const store = configureStore();

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
