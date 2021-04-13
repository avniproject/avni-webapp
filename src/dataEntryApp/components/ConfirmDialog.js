import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import { useTranslation } from "react-i18next";

const ConfirmDialog = ({ title, message, open, setOpen, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle id="title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">
          {t("no")}
        </Button>
        <Button
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          color="primary"
          autoFocus
        >
          {t("yes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmDialog;
