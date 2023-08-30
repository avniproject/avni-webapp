import React from "react";
import Button from "@material-ui/core/Button";
import { Dialog } from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import MuiComponentHelper from "../../common/utils/MuiComponentHelper";

export const AlertModal = ({ message, showAlert, setShowAlert, className }) => {
  return (
    <Dialog
      open={showAlert}
      onClose={MuiComponentHelper.getDialogClosingHandler(() => setShowAlert(false))}
    >
      <DialogTitle>{message.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message.content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={() => setShowAlert(false)}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};
