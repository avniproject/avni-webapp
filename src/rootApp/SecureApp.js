import React, { Component } from "react";
import { Authenticator, Greetings, SignUp, SignIn } from "aws-amplify-react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import _ from "lodash";

import "./SecureApp.css";
import App from "./App";
import { setCognitoUser } from "./ducks";
import { customAmplifyErrorMsgs } from "./utils";

import CustomSignIn from "./CustomSignIn";

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

  hasSignedIn() {
    return this.props.user.authState === "signedIn";
  }

  render() {
    const redirect_url = new URLSearchParams(window.location.search).get("redirect_url");
    if (!_.isEmpty(redirect_url) && this.hasSignedIn()) {
      window.location.href = redirect_url;
      return <></>;
    }

    return this.props.user.authState === "signedIn" ? (
      <App />
    ) : (
      <div className="centerContainer">
        <Authenticator
          hide={[Greetings, SignUp, SignIn]}
          onStateChange={this.setAuthState}
          errorMessage={customAmplifyErrorMsgs}
        >
          <CustomSignIn />
        </Authenticator>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.app.user
});

export default withRouter(
  connect(
    mapStateToProps,
    { setCognitoUser }
  )(SecureApp)
);
