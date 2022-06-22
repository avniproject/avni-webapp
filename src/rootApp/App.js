import React, { Component } from "react";
import { connect } from "react-redux";
import Routes from "./Routes";
import { getUserInfo } from "./ducks";
import { cognitoInDev, isDevEnv } from "../common/constants";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(51,151,243)"
    },
    secondary: {
      main: "rgba(0, 0, 0, 1)"
    }
  }
});

class App extends Component {
  componentDidMount() {
    if (isDevEnv && !cognitoInDev) {
      this.props.getUserInfo();
    }
  }

  render() {
    return (
      this.props.appInitialised && (
        <MuiThemeProvider theme={theme}>
          <div>
            <Routes />
          </div>
        </MuiThemeProvider>
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
