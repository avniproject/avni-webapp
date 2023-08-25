import React from "react";
import { makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import { isFunction } from "lodash";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
import logo from "../formDesigner/styles/images/avniLogo.png";
import Link from "@material-ui/core/Link";
import Colors from "./Colors";
import { InternalLink } from "../common/components/utils";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
    flexDirection: "row"
  },
  errorContainer: {
    padding: "5px",
    backgroundColor: Colors.HighlightBackgroundColor,
    border: "2px solid #d1d2d2",
    borderRadius: 5,
    marginTop: "10px"
  }
}));

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
    const url = "#/app";
    window.open(`${window.location.origin}/${url}`, "_self");
    window.location.reload();
  };

  return (
    <div>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            <InternalLink onClick={appHome}>
              <img src={logo} alt="logo" />
            </InternalLink>
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.container}>
        <Typography variant="h1" gutterBottom>
          oops!
        </Typography>
        <Typography variant="h4" gutterBottom>
          There was a problem when loading this page. Please contact administrator if you see this
          again.
        </Typography>
        <Link onClick={() => setShowError(true)}>Show error details</Link>
        <div style={{ display: showError ? "block" : "none" }} className={classes.errorContainer}>
          <Typography variant="body2">{error.stack}</Typography>
        </div>
        <div className={classes.buttonContainer}>
          <Button style={{ marginRight: 20 }} variant="contained" color="primary" onClick={appHome}>
            Back to Home
          </Button>
          <Button variant="contained" color="primary" onClick={reload}>
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ReduxErrorFallbackDialog({ error, open, handleClose }) {
  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <ErrorFallback error={error} onClose={handleClose} />
    </Dialog>
  );
}
