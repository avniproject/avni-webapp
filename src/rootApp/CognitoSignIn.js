import React from "react";
import { SignIn } from "aws-amplify-react";
import SignInView from "./views/SignInView";
import { isProdEnv } from "../common/constants";
import { isDisallowedPassword } from "./utils";

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
          if (!isProdEnv && isDisallowedPassword(this.inputs.password)) {
            alert("Password change required.");
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
