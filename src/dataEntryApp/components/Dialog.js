import React, { Fragment } from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import { Box, Typography} from "@material-ui/core";
import { LineBreak } from "../../common/components/utils";
import Chip from "../components/PagenatorButton";



const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)(props => {
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
  },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
    justifyContent:"center"
  },
}))(MuiDialogActions);

const CustomizedDialog = ({ title, showSuccessIcon, message, showOkbtn,openDialogContainer,onOk }) => {  
  const [open, setOpen] = React.useState(openDialogContainer || false);  

  const handleClickOpen = () => {           
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleOk = () => {
    setOpen(false);
    onOk(true);        
  }
  
  return (
    <Fragment>      
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Save
      </Button> */}
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        {title &&
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {title}
        </DialogTitle>}
        <DialogContent>                   
        <Box display="flex" flexDirection={"column"} flexWrap="wrap" justifyContent="space-between" alignItems="center">         
            {showSuccessIcon &&  <CheckCircleOutlineRoundedIcon/>}
            <LineBreak num={2}/>
            {message && <Typography gutterBottom>{message}</Typography>}
      </Box>                      
        </DialogContent>
        <DialogActions>
          {showOkbtn && 
          <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="space-start" alignItems="center">         
          <Button autoFocus onClick={handleOk} color="primary">
            Ok
          </Button>
          {/* <Chip>Ok</Chip> */}
          </Box>}
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
export default CustomizedDialog;

