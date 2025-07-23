import SignInView from "./SignInView";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { httpClient } from "../../common/utils/httpClient";
import { Typography } from "@mui/material";
import _ from "lodash";
import { setAuthSession } from "../ducks";
import IdpDetails from "../security/IdpDetails";
import BaseAuthSession from "../security/BaseAuthSession";
import { DISALLOWED_PASSWORD_BLOCK_LOGIN_MSG, isDisallowedPassword } from "../utils";
import ApplicationContext from "../../ApplicationContext";

const KeycloakSignInView = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const authSession = useSelector(state => state.app.authSession);

  function onSignIn() {
    if (ApplicationContext.isNonProdAndNonDevEnv() && isDisallowedPassword(password)) {
      alert(DISALLOWED_PASSWORD_BLOCK_LOGIN_MSG);
    } else {
      const [url, request] = httpClient.idp.getAuthRequest(username, password);
      httpClient
        .postUrlEncoded(url, request)
        .then(x => x.data)
        .then(data => {
          httpClient.idp.setAccessToken(data["access_token"]);
          dispatch(setAuthSession(BaseAuthSession.AuthStates.SignedIn, null, IdpDetails.keycloak));
        })
        .catch(error => {
          setError(`${error.response.statusText}: ${error.response.data["error_description"]}`);
        });
    }
  }

  function inputFieldChanged(e) {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    else if (name === "password") setPassword(value);
  }

  return (
    <div className="centerContainer">
      {!_.isNil(error) && (
        <Typography variant={"h6"} style={{ color: "red", marginLeft: 20 }}>
          {error}
        </Typography>
      )}
      <SignInView
        disallowForgottenPasswordReset={true}
        loading={false}
        onForgotPassword={() => {}}
        onSignIn={() => onSignIn()}
        notifyInputChange={e => inputFieldChanged(e)}
      />
    </div>
  );
};

export default KeycloakSignInView;
