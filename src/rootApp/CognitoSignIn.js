import React from "react";
import { SignIn } from "aws-amplify-react";
import SignInView from "./views/SignInView";

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
        onSignIn={() => super.signIn()}
        onForgotPassword={() => super.changeState("forgotPassword")}
        loading={this.state.loading}
      />
    );
  }
}

export default CognitoSignIn;
