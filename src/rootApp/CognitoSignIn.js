import React from "react";
import { SignIn } from "aws-amplify-react";
import SignInView from "./views/SignInView";
import { DISALLOWED_PASSWORD_BLOCK_LOGIN_MSG, isDisallowedPassword } from "./utils";
import ApplicationContext from "../ApplicationContext";

class CognitoSignIn extends SignIn {
  constructor(props) {
    super(props);
    this._validAuthStates = ["signIn", "signedOut", "signedUp"];

    this.state = {
      password: "",
      showPassword: false
    };
  }

  showComponent(theme) {
    return (
      <SignInView
        notifyInputChange={this.handleInputChange}
        onSignIn={() => {
          if (ApplicationContext.isNonProdAndNonDevEnv() && isDisallowedPassword(this.inputs.password)) {
            alert(DISALLOWED_PASSWORD_BLOCK_LOGIN_MSG);
          } else {
            super.signIn();
          }
        }}
        onForgotPassword={() => super.changeState("forgotPassword")}
        loading={this.state.loading}
      />
    );
  }
}

export default CognitoSignIn;
