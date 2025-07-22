import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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

function SecureApp({ genericConfig }) {
  const dispatch = useDispatch();
  const authSession = useSelector(state => state.app.authSession);

  useEffect(() => {
    if (KeycloakWebClient.isAuthenticatedWithKeycloak()) {
      dispatch(setAuthSession(BaseAuthSession.AuthStates.SignedIn, null, IdpDetails.keycloak));
    }
    if (genericConfig) {
      dispatch(initGenericConfig(genericConfig));
    }
  }, [dispatch, genericConfig]);

  const hasSignedIn = () => {
    return _.get(authSession, "authState") === BaseAuthSession.AuthStates.SignedIn;
  };

  const redirect_url = new URLSearchParams(window.location.search).get("redirect_url");
  if (!_.isEmpty(redirect_url) && hasSignedIn()) {
    httpClient.fetchJson("/ping").then(() => {
      window.open(redirect_url, "_self");
    });
    return null;
  }

  if (hasSignedIn()) return <App />;

  const idpType = httpClient.idp.idpType;

  if (idpType === IdpDetails.cognito) {
    return (
      <div className="centerContainer">
        <Authenticator.Provider>
          <CognitoSignIn onSignedIn={user => dispatch(setAuthSession(BaseAuthSession.AuthStates.SignedIn, user, IdpDetails.cognito))} />
        </Authenticator.Provider>
      </div>
    );
  }

  if (idpType === IdpDetails.keycloak) return <KeycloakSignInView />;
  else return <ChooseIdpView onIdpChosen={() => {}} />;
}

export default SecureApp;
