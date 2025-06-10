import React from "react";
import { Button, Dialog, DialogActions, DialogContentText, DialogTitle, DialogContent } from "@mui/material";

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
