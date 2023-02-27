import React from "react";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";

import "./index.css";
import "jquery";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap";
import "./formDesigner/App.css";
import { store } from "./common/store";
import { cognitoInDev, isProdEnv } from "./common/constants";
import { App, SecureApp } from "./rootApp";

import { ThemeProvider, StylesProvider, createGenerateClassName } from "@material-ui/styles";
import { createTheme } from "@material-ui/core/styles";
import * as Colors from "@material-ui/core/colors";
import { httpClient } from "common/utils/httpClient";

const theme = createTheme({
  palette: {
    primary: Colors.blue,
    secondary: Colors.grey
  }
});

const generateClassName = createGenerateClassName({
  productionPrefix: "avnijss"
});

httpClient.initHeadersForDevEnv();

const MainApp = () => {
  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <HashRouter>{isProdEnv || cognitoInDev ? <SecureApp /> : <App />}</HashRouter>
        </Provider>
      </ThemeProvider>
    </StylesProvider>
  );
};

export default MainApp;
