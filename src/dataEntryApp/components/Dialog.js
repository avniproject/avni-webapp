import React, { Fragment } from "react";
import { withStyles, makeStyles } from "@mui/styles";
import { Dialog, DialogContent, DialogActions, IconButton, Box, Typography, Button } from "@mui/material";
import { Close, CheckCircleOutline } from "@mui/icons-material";
import { LineBreak } from "../../common/components/utils";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    margin: "0 50"
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  okbuttonStyle: {
    backgroundColor: "orange",
    color: "white",
    height: 30,
    fontSize: 12,
    width: 100,
    cursor: "pointer",
    borderRadius: 50,
    padding: "4px 25px"
  },
  iconstyle: {
    fontSize: "4rem",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontWeight: 400,
    color: "gray"
  }
}));

const StyledDialogTitle = withStyles(useStyles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <div className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose} size="large">
          <Close />
        </IconButton>
      ) : null}
    </div>
  );
});

const StyledDialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    margin: "0px 20px"
  }
}))(DialogContent);

const StyledDialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
    justifyContent: "center"
  }
}))(DialogActions);

const CustomizedDialog = ({ title, showSuccessIcon, message, showOkbtn, openDialogContainer, onOk }) => {
  const [open, setOpen] = React.useState(openDialogContainer || false);
  const classes = useStyles();

  const handleClose = () => {
    setOpen(false);
  };

  const handleOk = () => {
    setOpen(false);
    onOk(true);
  };

  return (
    <Fragment>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        {title && (
          <StyledDialogTitle id="customized-dialog-title" onClose={handleClose}>
            {title}
          </StyledDialogTitle>
        )}
        <StyledDialogContent>
          <Box display="flex" flexDirection="column" flexWrap="wrap" justifyContent="space-between" alignItems="center">
            {showSuccessIcon && <CheckCircleOutline className={classes.iconstyle} />}
            <LineBreak num={2} />
            {message && <Typography gutterBottom>{message}</Typography>}
          </Box>
        </StyledDialogContent>
        <StyledDialogActions>
          {showOkbtn && (
            <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="flex-start" alignItems="center">
              <Button className={classes.okbuttonStyle} onClick={handleOk} color="primary">
                Ok
              </Button>
            </Box>
          )}
        </StyledDialogActions>
      </Dialog>
    </Fragment>
  );
};

export default CustomizedDialog;
