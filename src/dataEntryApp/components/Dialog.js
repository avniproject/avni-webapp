import React, { Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import CheckCircleOutlineRoundedIcon from "@material-ui/icons/CheckCircleOutlineRounded";
import { Box, Typography, Button } from "@material-ui/core";
import { LineBreak } from "../../common/components/utils";
import { makeStyles } from "@material-ui/core/styles";

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
    "border-radius": 50,
    padding: "4px 25px"
  },
  iconstyle: {
    "font-size": "4rem",
    "font-family": "Roboto, Helvetica, Arial, sans-serif",
    "font-weight": 400,
    color: "gray"
  }
}));

const DialogTitle = withStyles(useStyles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    margin: "0px 20px"
  }
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
    justifyContent: "center"
  }
}))(MuiDialogActions);

const CustomizedDialog = ({
  title,
  showSuccessIcon,
  message,
  showOkbtn,
  openDialogContainer,
  onOk
}) => {
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
      {/* <Button variant="outlined" color="primary" onClick={ setOpen(true);}>
        Save
      </Button> */}
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        {title && (
          <DialogTitle id="customized-dialog-title" onClose={handleClose}>
            {title}
          </DialogTitle>
        )}
        <DialogContent>
          <Box
            display="flex"
            flexDirection={"column"}
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
          >
            {showSuccessIcon && <CheckCircleOutlineRoundedIcon className={classes.iconstyle} />}
            <LineBreak num={2} />
            {message && <Typography gutterBottom>{message}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          {showOkbtn && (
            <Box
              display="flex"
              flexDirection={"row"}
              flexWrap="wrap"
              justifyContent="space-start"
              alignItems="center"
            >
              <Button className={classes.okbuttonStyle} onClick={handleOk} color="primary">
                Ok
              </Button>
              {/* <Chip className={classes.okbuttonStyle} onClick={handleOk}>OK</Chip> */}
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};
export default CustomizedDialog;
