import React, { Component } from "react";
import { connect } from "react-redux";

import Routes from "./Routes";
import { getUserInfo } from "./ducks";
import { cognitoInDev, isDevEnv } from "../common/constants";

class App extends Component {
  componentDidMount() {
    if (isDevEnv && !cognitoInDev) {
      this.props.getUserInfo();
    }
  }

  render() {
    return (
      this.props.appInitialised && (
        /**
             This check ensures crucial app state is initialised before
             components further down the tree (like Admin) are loaded
            **/
        <div>
          <Routes />
        </div>
      )
    );
  }
}

const mapStateToProps = state => ({
  appInitialised: state.app.appInitialised
});

export default connect(
  mapStateToProps,
  { getUserInfo }
)(App);
