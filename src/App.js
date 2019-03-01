import React, { Component } from 'react';
import { Auth } from "aws-amplify";
import { withAuthenticator, Greetings, SignIn,
  ConfirmSignIn, ForgotPassword, RequireNewPassword,
  ConfirmSignUp, VerifyContact, Loading } from 'aws-amplify-react';
import logo from './logo.svg';
import './App.css';
import {isDevEnv} from "./constants";

class App extends Component {
  constructor(props) {
    super(props);
    this.signOut = this.signOut.bind(this);
  }

  componentDidMount() {
    !isDevEnv &&
      Auth.currentAuthenticatedUser()
          .then(user => console.log(user))
          .catch(err => console.log(err));
  }

  userIsSignedIn() {
    return this.props.authState === 'signedIn';
  };

  signOut() {
    Auth.signOut()
        .then(data => console.log(data))
        .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {this.userIsSignedIn() && <button onClick={this.signOut}>Sign Out</button>}
        </header>
      </div>
    );
  }
}

const authenticatorComponents = [
  <Greetings/>,
  <SignIn/>,
  <ConfirmSignIn/>,
  <ForgotPassword/>,
  <RequireNewPassword/>,
  <ConfirmSignUp/>,
  <VerifyContact/>,
  <Loading/>
];

export default isDevEnv ? App : withAuthenticator(App, {authenticatorComponents});
