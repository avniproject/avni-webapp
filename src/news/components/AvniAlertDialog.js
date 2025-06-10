import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import { CustomDialogTitle } from "./CustomDialogTitle";
import MuiComponentHelper from "../../common/utils/MuiComponentHelper";

export const AvniAlertDialog = ({ open, setOpen, title, message, actions }) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog onClose={MuiComponentHelper.getDialogClosingHandler()} open={open}>
      <CustomDialogTitle onClose={handleClose}>{title}</CustomDialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};
