import React from "react";
import { makeStyles } from "@mui/styles";
import { CircularProgress, Modal } from "@mui/material";
import MuiComponentHelper from "../utils/MuiComponentHelper";

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
    <Modal onClose={MuiComponentHelper.getDialogClosingHandler()} open={open}>
      <CircularProgress size={150} className={classes.progress} />
    </Modal>
  );
};

export default ActivityIndicatorModal;
