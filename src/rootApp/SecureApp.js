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
import { setAuthSession } from "./ducks";
import { Authenticator, Greetings, SignIn, SignUp } from "aws-amplify-react";
import { customAmplifyErrorMsgs } from "./utils";
import BaseAuthSession from "./security/BaseAuthSession";
import ChooseIdpView from "./ChooseIdpView";

class SecureApp extends Component {
  constructor(props) {
    super(props);
    this.setAuthState = this.setAuthState.bind(this);
  }

  setAuthState(authState, authData) {
    if (authState === BaseAuthSession.AuthStates.SignedIn) {
      this.props.setAuthSession(authState, authData, IdpDetails.cognito);
    }
  }

  componentDidMount() {
    if (
      httpClient.idp.idpType === IdpDetails.keycloak &&
      !_.isNil(httpClient.idp.getAccessToken())
    ) {
      this.props.setAuthSession(BaseAuthSession.AuthStates.SignedIn, null, IdpDetails.keycloak);
    }
  }

  hasSignedIn() {
    return _.get(this.props, "authSession.authState") === BaseAuthSession.AuthStates.SignedIn;
  }

  render() {
    const redirect_url = new URLSearchParams(window.location.search).get("redirect_url");
    if (!_.isEmpty(redirect_url) && this.hasSignedIn()) {
      window.location.href = redirect_url;
      return <></>;
    }

    if (this.hasSignedIn()) return <App />;

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
    else return <ChooseIdpView onIdpChosen={() => this.setState({ idpChosen: true })} />;
  }
}

const mapStateToProps = state => ({
  authSession: state.app.authSession
});

export default withRouter(
  connect(
    mapStateToProps,
    { setAuthSession }
  )(SecureApp)
);
