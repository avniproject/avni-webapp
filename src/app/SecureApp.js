import React, { Component } from "react";
import { Authenticator, Greetings, SignUp } from "aws-amplify-react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

import './SecureApp.css';
import App from "./App";
import logo from "../logo.png";
import { initCognito, setCognitoUser } from './ducks';


class SecureApp extends Component {
    constructor(props) {
        super(props);
        this.setAuthState = this.setAuthState.bind(this);
    }

    setAuthState(authState, authData) {
        if (authState === 'signedIn') {
            this.props.setCognitoUser(authState, authData);
        }
    }

    componentDidMount() {
        this.props.initCognito();
    }

    render() {
        return (
            this.props.user.authState === 'signedIn' ?
                <App />
                :
                <div className="authContainer">
                  <img src={logo} alt="OpenCHS" />
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


export default withRouter(
    connect(mapStateToProps, { initCognito, setCognitoUser })(SecureApp)
);
