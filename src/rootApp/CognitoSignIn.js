import React from "react";
import { Authenticator, Greetings, SignIn, SignUp } from "aws-amplify-react";
import SignInView from "./views/SignInView";
import { customAmplifyErrorMsgs } from "./utils";
import { connect } from "react-redux";
import { setCognitoUser } from "./ducks";

class CognitoSignIn extends SignIn {
  constructor(props) {
    super(props);
    this._validAuthStates = ["signIn", "signedOut", "signedUp"];

    this.state = {
      password: "",
      showPassword: false
    };
  }

  setAuthState(authState, authData) {
    if (authState === "signedIn") {
      this.props.setCognitoUser(authState, authData);
    }
  }

  showComponent(theme) {
    return (
      <div className="centerContainer">
        <Authenticator
          hide={[Greetings, SignUp, SignIn]}
          onStateChange={this.setAuthState}
          errorMessage={customAmplifyErrorMsgs}
        >
          <SignInView
            notifyInputChange={this.handleInputChange}
            onSignIn={() => super.signIn()}
            onForgotPassword={() => super.changeState("forgotPassword")}
            loading={this.state.loading}
          />
        </Authenticator>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.app.user
});

export default connect(
  mapStateToProps,
  { setCognitoUser }
)(CognitoSignIn);
