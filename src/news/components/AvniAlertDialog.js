import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import { CustomDialogTitle } from "./CustomDialogTitle";

export const AvniAlertDialog = ({ open, setOpen, title, message, actions }) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog disableBackdropClick open={open}>
      <CustomDialogTitle onClose={handleClose}>{title}</CustomDialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};
