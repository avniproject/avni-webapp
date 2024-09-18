import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import CloseIcon from "@material-ui/icons/Close";
import { green } from "@material-ui/core/colors";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import { makeStyles } from "@material-ui/core/styles";
import WarningIcon from "@material-ui/icons/Warning";

const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon,
  warning: WarningIcon
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: "#d0011b"
  },
  warning: {
    backgroundColor: "#ffc107"
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: "flex",
    alignItems: "center"
  }
}));

const textColors = {
  success: "#fff",
  warning: "#000",
  error: "#fff"
};

function MySnackbarContentWrapper({ className, message, onClose, variant = "success", ...other }) {
  const classes = useStyles1();
  const Icon = variantIcon[variant];
  const textColor = textColors[variant];
  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          <h5 style={{ color: textColor }}>{message}</h5>
        </span>
      }
      action={[
        <IconButton key="close" aria-label="close" color="inherit" onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>
      ]}
      {...other}
    />
  );
}

MySnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["success"]).isRequired
};

export default function CustomizedSnackbar({
  getDefaultSnackbarStatus,
  defaultSnackbarStatus,
  onExited,
  variant,
  message,
  autoHideDuration = 2000
}) {
  function handleClose(event, reason) {
    if (reason === "clickaway") {
      getDefaultSnackbarStatus(false);
      return;
    }
    getDefaultSnackbarStatus(false);
  }

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        open={defaultSnackbarStatus}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        TransitionProps={{ onExited: onExited }}
      >
        <MySnackbarContentWrapper onClose={handleClose} variant={variant} message={message} />
      </Snackbar>
    </div>
  );
}

CustomizedSnackbar.defaultProps = {
  defaultSnackbarStatus: true
};
