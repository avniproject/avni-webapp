import React, { Component } from "react";
import Auth from "@aws-amplify/auth";
import { Authenticator, Greetings, SignUp } from "aws-amplify-react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

import { isFauxProd, isDevEnv } from '../constants';
import awsConfigFromEnv from '../awsConfig';
import App from "./App";
import logo from "../logo.png";
import _reducer, * as actions from './ducks';


class SecureApp extends Component {
    constructor(props) {
        super(props);
        this.setAuthState = this.setAuthState.bind(this);
        this.configureAuth = this.configureAuth.bind(this);
    }

    setAuthState(authState, authData) {
        if (authState === 'signedIn') {
            this.props.setCognitoUser(authState, authData);
            fetch('/userInfo')
                .then(data => data.json())
                .then(userInfo => this.props.setUserInfo(userInfo));
        }
    }

    configureAuth(awsConfig) {
        Auth.configure({
            mandatorySignIn: true,
            region: awsConfig.region,
            userPoolId: awsConfig.poolId,
            userPoolWebClientId: awsConfig.clientId
        });
    }

    componentDidMount() {
        if(isDevEnv && isFauxProd) {
            this.props.setAwsConfig(awsConfigFromEnv.cognito);
            this.configureAuth(awsConfigFromEnv.cognito);
        } else {
            fetch('/cognito-details')
                .then(data => this.props.setAwsConfig(data.json()))
                .then(resp => this.configureAuth(resp.payload));
        }
    }

    render() {
        return (
            this.props.user.authState === 'signedIn' ?
                <App />
                :
                <div className="App-header">
                  <img src={logo} alt="logo" />
                  <Authenticator
                      hide={[Greetings, SignUp]}
                      onStateChange={this.setAuthState} />
                </div>
        );
    }
}

const mapStateToProps = state => ({
    user: state.app.user
});


export default withRouter(connect(mapStateToProps, actions)(SecureApp));
