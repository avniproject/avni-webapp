import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import "./SecureApp.css";
import App from "./App";
import CognitoSignIn from "./CognitoSignIn";
import httpClient from "../common/utils/httpClient";
import IdpDetails from "./security/IdpDetails";
import KeycloakSignInView from "./views/KeycloakSignInView";
import { setCognitoUser } from "./ducks";
import { Authenticator, Greetings, SignIn, SignUp } from "aws-amplify-react";
import { customAmplifyErrorMsgs } from "./utils";

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

    if (this.props.user.authState === "signedIn") return <App />;

    const idpType = httpClient.idp.idpType;

    if (idpType === IdpDetails.cognito) {
      return (
        <div className="centerContainer">
          <Authenticator
            hide={[Greetings, SignUp, SignIn]}
            onStateChange={this.setAuthState}
            errorMessage={customAmplifyErrorMsgs}
          >
            <CognitoSignIn />
          </Authenticator>
        </div>
      );
    }

    if (idpType === IdpDetails.keycloak) return <KeycloakSignInView />;
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
