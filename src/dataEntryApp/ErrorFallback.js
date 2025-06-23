import React from "react";
import { makeStyles } from "@mui/styles";
import { Button, AppBar, Toolbar, Typography } from "@mui/material";
import _, { isFunction } from "lodash";
import logo from "../formDesigner/styles/images/avniLogo.png";
import Colors from "./Colors";

const useStyles = makeStyles(theme => ({
  appBar: {
    position: "relative",
    background: "white"
  },
  root: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    marginLeft: theme.spacing(10),
    marginRight: theme.spacing(10),
    padding: theme.spacing(5),
    paddingTop: theme.spacing(3)
  },
  container: {
    display: "flex",
    flexDirection: "column",
    marginTop: "50px",
    marginBottom: "50px",
    marginRight: "20%",
    marginLeft: "20%"
  },
  buttonContainer: {
    marginTop: "50px",
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center"
  },
  errorContainer: {
    padding: "5px",
    backgroundColor: Colors.HighlightBackgroundColor,
    border: "2px solid #d1d2d2",
    borderRadius: 5,
    marginTop: "10px"
  }
}));

function ErrorItem({ fieldName, fieldValue }) {
  return (
    <>
      <Typography variant="h6">{fieldName}</Typography>
      {fieldValue && (
        <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
          {fieldValue}
        </Typography>
      )}
    </>
  );
}

export function ErrorFallback({ error, onClose }) {
  const classes = useStyles();
  const [showError, setShowError] = React.useState(false);

  const closeDialogIfRequired = () => {
    if (isFunction(onClose)) {
      onClose();
    }
  };

  const reload = () => {
    closeDialogIfRequired();
    window.location.reload();
  };

  const appHome = () => {
    closeDialogIfRequired();
    const url = "#/";
    window.open(`${window.location.origin}/${url}`, "_self");
    window.location.reload();
  };

  const clearSession = () => {
    closeDialogIfRequired();
    localStorage.clear();
    appHome();
  };

  return (
    <div>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" sx={{ whiteSpace: "nowrap" }}>
            <img src={logo} alt="logo" />
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.container}>
        <Typography variant="h1" sx={{ mb: 1 }}>
          oops!
        </Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>
          There was a problem when loading this page. Please contact administrator.
        </Typography>
        {!showError && (
          <Button onClick={() => setShowError(true)} variant={"contained"}>
            Show error details
          </Button>
        )}
        {showError && (
          <Button
            onClick={() =>
              navigator.clipboard.writeText(
                `Message: ${_.get(error, "message")}\n\nStack: ${_.get(error, "stack")}\n\nSaga Stack: ${_.get(error, "sagaStack")}`
              )
            }
            variant={"contained"}
          >
            Copy Error
          </Button>
        )}
        <div style={{ display: showError ? "block" : "none" }} className={classes.errorContainer}>
          <ErrorItem fieldName="Message" fieldValue={error.message} />
          <ErrorItem fieldName="Error Stack" fieldValue={error.stack} />
          {error["sagaStack"] && <ErrorItem fieldName="Saga Stack" fieldValue={error["sagaStack"]} />}
        </div>
        <div className={classes.buttonContainer}>
          <Button style={{ marginRight: 20 }} variant="contained" color="primary" onClick={appHome}>
            Home
          </Button>
          <Button style={{ marginRight: 20 }} variant="contained" color="primary" onClick={reload}>
            Reload
          </Button>
          <Button variant="contained" color="primary" onClick={clearSession}>
            Clear session & reload (will logout)
          </Button>
        </div>
      </div>
    </div>
  );
}
