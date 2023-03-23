import React, { Component } from "react";
import { connect } from "react-redux";
import Routes from "./Routes";
import { getUserInfo } from "./ducks";
import IdpDetails from "./security/IdpDetails";
import httpClient from "../common/utils/httpClient";

class App extends Component {
  componentDidMount() {
    if (httpClient.idp.idpType === IdpDetails.none) {
      this.props.getUserInfo();
    }
  }

  render() {
    return (
      this.props.appInitialised && (
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
