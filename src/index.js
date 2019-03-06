import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App, AppWithAuth} from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import Auth from "@aws-amplify/auth";
import awsConfig from "./aws-config";
import { isDevEnv } from './constants';


Auth.configure({
    mandatorySignIn: true,
    region: awsConfig.cognito.REGION,
    userPoolId: awsConfig.cognito.USER_POOL_ID,
    userPoolWebClientId: awsConfig.cognito.APP_CLIENT_ID
});

ReactDOM.render(
    <BrowserRouter>
      { isDevEnv ? <App/> : <AppWithAuth /> }
    </BrowserRouter>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
