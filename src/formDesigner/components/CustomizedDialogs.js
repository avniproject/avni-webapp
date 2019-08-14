import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  }
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1)
  }
}))(MuiDialogActions);

class CustomizedDialogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      loading: false
    };
  }
  handleClose = () => {
    this.setState({
      open: false,
      loading: true
    });
  };
  render() {
    return (
      <div>
        <Dialog
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
        >
          <DialogContent dividers>
            <Typography gutterBottom>{this.props.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        {this.state.loading && <Redirect to="/concepts" />}
      </div>
    );
  }
}

export default CustomizedDialogs;
