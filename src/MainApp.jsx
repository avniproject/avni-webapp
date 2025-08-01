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

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2196f3",
      light: "#64b5f6",
      dark: "#1976d2",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#90caf9",
      light: "#c3fdff",
      dark: "#5d99c6",
      contrastText: "rgba(0, 0, 0, 0.87)"
    },
    background: {
      default: "#f3f8ff",
      paper: "#ffffff"
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(25, 118, 210, 0.7)",
      disabled: "rgba(0, 0, 0, 0.38)"
    },
    divider: "rgba(33, 150, 243, 0.12)",
    action: {
      hover: "rgba(33, 150, 243, 0.04)",
      selected: "rgba(33, 150, 243, 0.08)",
      disabled: "rgba(0, 0, 0, 0.26)",
      disabledBackground: "rgba(0, 0, 0, 0.12)"
    },
    error: {
      main: "#f44336",
      light: "#e57373",
      dark: "#d32f2f",
      contrastText: "#ffffff"
    },
    warning: {
      main: "#ff9800",
      light: "#ffb74d",
      dark: "#f57c00",
      contrastText: "rgba(0, 0, 0, 0.87)"
    },
    info: {
      main: "#2196f3",
      light: "#64b5f6",
      dark: "#1976d2",
      contrastText: "#ffffff"
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
      contrastText: "rgba(0, 0, 0, 0.87)"
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14
  },
  spacing: 8,
  shape: {
    borderRadius: 4
  }
});

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
