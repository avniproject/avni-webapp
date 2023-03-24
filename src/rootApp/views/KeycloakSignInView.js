import SignInView from "./SignInView";
import React, { useState } from "react";
import httpClient from "../../common/utils/httpClient";
import Typography from "@material-ui/core/Typography";
import _ from "lodash";

function KeycloakSignInView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  function onSignIn() {
    const [url, request] = httpClient.idp.getAuthRequest(username, password);
    httpClient
      .postUrlEncoded(url, request)
      .then(x => x.data)
      .then(data => {
        httpClient.idp.setAccessToken(data["access_token"]);
      })
      .catch(error => {
        setError(error.response.data["error_description"]);
      });
  }

  function inputFieldChanged(e) {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    else if (name === "password") setPassword(value);
  }

  return (
    <div className="centerContainer">
      {!_.isNil(error) && (
        <Typography variant={"h6"} style={{ color: "red" }}>
          {error}
        </Typography>
      )}
      <SignInView
        loading={false}
        onForgotPassword={() => {}}
        onSignIn={() => onSignIn()}
        notifyInputChange={e => inputFieldChanged(e)}
      />
    </div>
  );
}

export default KeycloakSignInView;
