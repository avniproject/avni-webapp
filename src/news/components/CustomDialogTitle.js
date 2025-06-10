import { Typography, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { withStyles } from "@mui/styles";
import React from "react";

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
});

export const CustomDialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <DialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      <IconButton aria-label="close" className={classes.closeButton} onClick={onClose} size="large">
        <Close />
      </IconButton>
    </DialogTitle>
  );
});
