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

import { createGenerateClassName, StylesProvider, ThemeProvider } from "@mui/styles";
import { StyledEngineProvider } from "@mui/system";
import { createTheme } from "@mui/material/styles";
import * as Colors from "@mui/material/colors";
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

// Wrapper to debug if the error is reported by the fallback or unhandled rejection
function ErrorBoundaryFallback({ error, onClose }) {
  return <ErrorFallback error={error} onClose={onClose} />;
}

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
    const unhandledError = ErrorMessageUtil.fromWindowUnhandledError(error, x => setUnhandledError(x));
    console.error("Unhandled Rejection Error", JSON.stringify(unhandledError));
    setUnhandledError(unhandledError);
  };

  if (!initialised) {
    if (unhandledRejectionError) return <ErrorFallback error={unhandledRejectionError} />;
    return null;
  }

  return (
    <StylesProvider generateClassName={generateClassName}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          {!unhandledRejectionError && (
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
              <Provider store={store}>
                <HashRouter>
                  {httpClient.idp.idpType === IdpDetails.none ? <App /> : <SecureApp genericConfig={genericConfig} />}
                </HashRouter>
              </Provider>
            </ErrorBoundary>
          )}
          {unhandledRejectionError && <ErrorFallback error={unhandledRejectionError} />}
        </ThemeProvider>
      </StyledEngineProvider>
    </StylesProvider>
  );
};

export default MainApp;
