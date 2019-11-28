import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";

import "./index.css";
import "jquery";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap";
import "./formDesigner/App.css";
import * as serviceWorker from "./serviceWorker";
import { store } from "./common/store";
import { cognitoInDev, isProdEnv } from "./common/constants";
import { App, SecureApp } from "./rootApp";

import { ThemeProvider, StylesProvider, createGenerateClassName } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import * as Colors from "@material-ui/core/colors";
import { httpClient } from "common/utils/httpClient";

const theme = createMuiTheme({
  palette: {
    primary: Colors.blue,
    secondary: Colors.grey
  }
});

const generateClassName = createGenerateClassName({
  productionPrefix: "avnijss"
});

httpClient.initHeadersForDevEnv();

ReactDOM.render(
  <StylesProvider generateClassName={generateClassName}>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <HashRouter>{isProdEnv || cognitoInDev ? <SecureApp /> : <App />}</HashRouter>
      </Provider>
    </ThemeProvider>
  </StylesProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
