import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Amplify from "aws-amplify";
import awsConfig from "./aws-config";
import {isDevEnv} from "./constants";

if (isDevEnv)
    window.LOG_LEVEL = 'DEBUG';

!isDevEnv && Amplify.configure({
    Auth: {
        mandatorySignIn: true,
        region: awsConfig.cognito.REGION,
        userPoolId: awsConfig.cognito.USER_POOL_ID,
        userPoolWebClientId: awsConfig.cognito.APP_CLIENT_ID
    },
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
