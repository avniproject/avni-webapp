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
import { grey, blue, red, orange, green } from "@mui/material/colors";
import { httpClient as http } from "./common/utils/httpClient";
import IdpDetails from "./rootApp/security/IdpDetails.ts";
import { configureAuth } from "./rootApp/utils";
import IdpFactory from "./rootApp/security/IdpFactory";
import { ErrorFallback } from "./dataEntryApp/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import ErrorMessageUtil from "./common/utils/ErrorMessageUtil";
import { handleStorageMigration } from "./common/utils/storageMigration";
import ChatbotWrapper from "./common/components/chatbot/ChatbotWrapper.tsx";
import { usePostHog } from "posthog-js/react";
import ApplicationContext from "./ApplicationContext";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: blue[500],
      light: blue[300],
      dark: blue[700],
      contrastText: "#ffffff",
    },
    secondary: {
      main: grey[200],
      light: grey[100],
      dark: grey[400],
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    grey: grey,
    background: {
      default: grey[100],
      paper: grey[50],
    },
    text: {
      primary: grey[900],
      secondary: grey[600],
      disabled: grey[400],
    },
    divider: grey[200],
    action: {
      hover: grey[100],
      selected: grey[200],
      disabled: grey[400],
      disabledBackground: grey[200],
    },
    error: {
      main: red[500],
      light: red[300],
      dark: red[700],
      contrastText: "#ffffff",
    },
    warning: {
      main: orange[500],
      light: orange[300],
      dark: orange[700],
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    info: {
      main: blue[500],
      light: blue[300],
      dark: blue[700],
      contrastText: "#ffffff",
    },
    success: {
      main: green[500],
      light: green[300],
      dark: green[700],
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
  },
  spacing: 8,
  shape: {
    borderRadius: 4,
  },
});

http.initHeadersForDevEnv();

function ErrorBoundaryFallback({ error, onClose }) {
  return <ErrorFallback error={error} onClose={onClose} />;
}

const MainApp = () => {
  const [initialised, setInitialised] = useState(false);
  const [unhandledRejectionError, setUnhandledError] = useState(null);
  const [genericConfig, setGenericConfig] = useState({});
  const posthog = usePostHog();

  const setupPostHog = () => {
    const analyticsOptOut = ApplicationContext.isNonProdEnv();
    const analyticsOptOutTemp = false; // TODO: remove after testing and before rolling out to prod
    console.log("analyticsOptOut", analyticsOptOut);

    if (analyticsOptOutTemp && !posthog.has_opted_out_capturing()) {
      posthog.opt_out_capturing();
    }
  };

  useEffect(() => {
    // Handle storage migration - clears all localStorage/sessionStorage on version change
    handleStorageMigration();
    http
      .fetchJson("/idp-details")
      .then((response) => response.json)
      .then((idpDetails) => {
        if (IdpDetails.cognitoEnabled(idpDetails)) {
          configureAuth(idpDetails.cognito);
        }
        http.setIdp(IdpFactory.createIdp(idpDetails.idpType, idpDetails));
        setGenericConfig(idpDetails.genericConfig);
        setupPostHog();
        setInitialised(true);
      })
      .catch((error) => {
        setUnhandledError(new Error(error.message));
      });
  }, []);

  window.onunhandledrejection = function (error) {
    const unhandledError = ErrorMessageUtil.fromWindowUnhandledError(
      error,
      (x) => setUnhandledError(x),
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
              <ChatbotWrapper />
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
