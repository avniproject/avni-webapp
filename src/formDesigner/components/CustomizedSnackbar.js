import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CloseIcon from "@material-ui/icons/Close";
import { green } from "@material-ui/core/colors";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";

const variantIcon = {
  success: CheckCircleIcon
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600]
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

function MySnackbarContentWrapper(props) {
  const classes = useStyles1();
  const { className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
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

export default function CustomizedSnackbar(props) {
  const [open, setOpen] = React.useState(props.defaultSnackbarStatus);
  const [redirectAlert, setRedirectAlert] = React.useState(false);
  function handleClose(event, reason) {
    if (reason === "clickaway") {
      props.allowRedirect && setRedirectAlert(true);
      !props.allowRedirect && props.getDefaultSnackbarStatus(false);
      return;
    }
    setOpen(false);
    !props.allowRedirect && props.getDefaultSnackbarStatus(false);
    props.allowRedirect && setRedirectAlert(true);
  }

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        open={open || props.defaultSnackbarStatus}
        autoHideDuration={1000}
        onClose={handleClose}
      >
        <MySnackbarContentWrapper onClose={handleClose} variant="success" message={props.message} />
      </Snackbar>
      {redirectAlert && <Redirect to={props.url} />}
    </div>
  );
}

CustomizedSnackbar.defaultProps = {
  allowRedirect: true,
  defaultSnackbarStatus: true
};
