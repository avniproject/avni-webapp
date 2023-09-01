import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";

import "./index.css";
import "jquery";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap";
import "./formDesigner/App.css";
import { store } from "./common/store";
import { App, SecureApp } from "./rootApp";

import { createGenerateClassName, StylesProvider, ThemeProvider } from "@material-ui/styles";
import { createTheme } from "@material-ui/core/styles";
import * as Colors from "@material-ui/core/colors";
import http, { httpClient } from "common/utils/httpClient";
import IdpDetails from "./rootApp/security/IdpDetails";
import { configureAuth } from "./rootApp/utils";
import IdpFactory from "./rootApp/security/IdpFactory";
import { ErrorFallback } from "./dataEntryApp/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import ErrorMessageUtil from "./common/utils/ErrorMessageUtil";

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
  const [initialised, setInitialised] = useState(false);
  const [unhandledRejectionError, setUnhandledError] = useState(null);
  const [genericConfig, setGenericConfig] = useState({});

  useEffect(() => {
    http
      .fetchJson("/idp-details")
      .then(response => response.json)
      .then(idpDetails => {
        if (IdpDetails.cognitoEnabled(idpDetails)) configureAuth(idpDetails.cognito);
        httpClient.setIdp(IdpFactory.createIdp(idpDetails.idpType, idpDetails));
        setGenericConfig(idpDetails.genericConfig);
        setInitialised(true);
      });
  }, []);

  window.onunhandledrejection = function(error) {
    const unhandledError = ErrorMessageUtil.fromWindowUnhandledError(error, x =>
      setUnhandledError(x)
    );
    console.error("Unhandled Rejection Error", JSON.stringify(unhandledError));
    setUnhandledError(unhandledError);
  };

  if (!initialised) {
    if (unhandledRejectionError) return <ErrorFallback error={unhandledRejectionError} />;
    return null;
  }

  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        {!unhandledRejectionError && (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Provider store={store}>
              <HashRouter>
                {httpClient.idp.idpType === IdpDetails.none ? (
                  <App />
                ) : (
                  <SecureApp genericConfig={genericConfig} />
                )}
              </HashRouter>
            </Provider>
          </ErrorBoundary>
        )}
        {unhandledRejectionError && <ErrorFallback error={unhandledRejectionError} />}
      </ThemeProvider>
    </StylesProvider>
  );
};

export default MainApp;
