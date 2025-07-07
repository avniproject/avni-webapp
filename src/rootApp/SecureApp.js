import { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import "./SecureApp.css";
import "@aws-amplify/ui-react/styles.css";
import App from "./App";
import { Authenticator } from "@aws-amplify/ui-react";
import CognitoSignIn from "./CognitoSignIn";
import { httpClient } from "../common/utils/httpClient";
import IdpDetails from "./security/IdpDetails";
import KeycloakSignInView from "./views/KeycloakSignInView";
import { initGenericConfig, setAuthSession } from "./ducks";
import BaseAuthSession from "./security/BaseAuthSession";
import ChooseIdpView from "./ChooseIdpView";
import KeycloakWebClient from "./security/KeycloakWebClient";

class SecureApp extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (KeycloakWebClient.isAuthenticatedWithKeycloak()) {
      this.props.setAuthSession(BaseAuthSession.AuthStates.SignedIn, null, IdpDetails.keycloak);
    }
    this.props.genericConfig && this.props.initGenericConfig(this.props.genericConfig);
  }

  hasSignedIn() {
    return _.get(this.props, "authSession.authState") === BaseAuthSession.AuthStates.SignedIn;
  }

  render() {
    const redirect_url = new URLSearchParams(window.location.search).get("redirect_url");
    if (!_.isEmpty(redirect_url) && this.hasSignedIn()) {
      httpClient.fetchJson("/ping").then(() => {
        window.open(redirect_url, "_self");
      });
      return null;
    }

    if (this.hasSignedIn()) return <App />;

    const idpType = httpClient.idp.idpType;

    if (idpType === IdpDetails.cognito) {
      return (
        <div className="centerContainer">
          <Authenticator.Provider>
            <CognitoSignIn onSignedIn={user => this.props.setAuthSession(BaseAuthSession.AuthStates.SignedIn, user, IdpDetails.cognito)} />
          </Authenticator.Provider>
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
    { setAuthSession, initGenericConfig }
  )(SecureApp)
);
