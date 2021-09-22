import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  progress: {
    position: "absolute",
    top: "30%",
    left: "50%",
    zIndex: 1
  }
}));

const ActivityIndicatorModal = ({ open }) => {
  const classes = useStyles();
  return (
    <Modal disableBackdropClick open={open}>
      <CircularProgress size={150} className={classes.progress} />
    </Modal>
  );
};

export default ActivityIndicatorModal;
