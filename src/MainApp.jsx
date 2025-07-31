import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import "./index.css";
import "@aws-amplify/ui-react/styles.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap";
import "./formDesigner/App.css";
import { store } from "./common/store";
import { App, SecureApp } from "./rootApp";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/system";
import { httpClient as http } from "./common/utils/httpClient";
import IdpDetails from "./rootApp/security/IdpDetails";
import { configureAuth } from "./rootApp/utils";
import IdpFactory from "./rootApp/security/IdpFactory";
import { ErrorFallback } from "./dataEntryApp/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import ErrorMessageUtil from "./common/utils/ErrorMessageUtil";

const theme = createTheme({});

http.initHeadersForDevEnv();

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
        if (IdpDetails.cognitoEnabled(idpDetails)) {
          configureAuth(idpDetails.cognito);
        }
        http.setIdp(IdpFactory.createIdp(idpDetails.idpType, idpDetails));
        setGenericConfig(idpDetails.genericConfig);
        setInitialised(true);
      })
      .catch(error => {
        setUnhandledError(new Error(error.message));
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
    if (unhandledRejectionError)
      return <ErrorFallback error={unhandledRejectionError} />;
    return null;
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        {!unhandledRejectionError && (
          <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
            <Provider store={store}>
              <HashRouter>
                {http.idp.idpType === IdpDetails.none ? (
                  <App />
                ) : (
                  <SecureApp genericConfig={genericConfig} />
                )}
              </HashRouter>
            </Provider>
          </ErrorBoundary>
        )}
        {unhandledRejectionError && (
          <ErrorFallback error={unhandledRejectionError} />
        )}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default MainApp;
