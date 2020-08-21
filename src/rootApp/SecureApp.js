import React, { Component } from "react";
import { Authenticator, Greetings, SignUp, SignIn } from "aws-amplify-react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import "./SecureApp.css";
import App from "./App";
import logo from "../logo.png";
import { initCognito, setCognitoUser } from "./ducks";
import { customAmplifyErrorMsgs } from "./utils";

import CustomSignIn from "./CustomSignIn";
import FreshChat from "../common/components/FreshChat";

class SecureApp extends Component {
  constructor(props) {
    super(props);
    this.setAuthState = this.setAuthState.bind(this);
  }

  setAuthState(authState, authData) {
    if (authState === "signedIn") {
      this.props.setCognitoUser(authState, authData);
    }
  }

  componentDidMount() {
    if (this.props.user.authState !== "signedIn") {
      this.props.initCognito();
    }
  }

  render() {
    return this.props.user.authState === "signedIn" ? (
      <App />
    ) : (
      <div className="centerContainer">
        {/* <img src={logo} alt="Avni" /> */}
        {this.props.authConfigured && (
          <Authenticator
            hide={[Greetings, SignUp, SignIn]}
            onStateChange={this.setAuthState}
            errorMessage={customAmplifyErrorMsgs}
            // amplifyConfig={config}
          >
            <CustomSignIn />
          </Authenticator>
        )}
        {!window.location.href.includes("localhost") && <FreshChat />}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.app.user,
  authConfigured: state.app.authConfigured
});

export default withRouter(
  connect(
    mapStateToProps,
    { initCognito, setCognitoUser }
  )(SecureApp)
);
