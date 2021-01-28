import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";

const MessageDialog = ({ title, message, open, onOk }) => {
  return (
    <Dialog open={open} onClose={() => {}}>
      <DialogTitle id="title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onOk();
          }}
          color="primary"
          autoFocus
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default MessageDialog;
