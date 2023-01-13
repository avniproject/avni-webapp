import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { green } from "@material-ui/core/colors";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import { makeStyles } from "@material-ui/core/styles";

const variantIcon = {
  success: CheckCircleIcon
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600],
    minWidth: 220
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
  const { className, message, variant, ...other } = props;
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
      {...other}
    />
  );
}

MySnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  variant: PropTypes.oneOf(["success"]).isRequired
};

export default function CustomizedSnackbar(props) {
  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        open={props.defaultSnackbarStatus}
        autoHideDuration={2000}
      >
        <MySnackbarContentWrapper variant="success" message={props.message} />
      </Snackbar>
    </div>
  );
}

CustomizedSnackbar.defaultProps = {
  defaultSnackbarStatus: true
};
