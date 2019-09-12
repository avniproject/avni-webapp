import React, { Component } from "react";
import ProgramCard from "../components/ProgramCard";
import NewFormModal from "../components/NewFormModal";
import axios from "axios";
import Button from "@material-ui/core/Button";

import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

class Forms extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [], loading: true, open: false };
    this.setState = this.setState.bind(this);
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    console.log(`axios header in forms = ${JSON.stringify(axios.defaults.headers.common)}`);
    axios
      .get("/forms")
      .then(response => {
        this.setState({ data: response.data, loading: false });
      })
      .catch(error => {
        this.setState({ loading: false });
      });
  }
  handleClose() {
    this.setState({ open: false });
  }
  NewFormButton() {
    return (
      <div style={{ textAlign: "right" }}>
        <Button variant="outlined" color="secondary" onClick={this.handleClickOpen}>
          {" "}
          New Form{" "}
        </Button>
      </div>
    );
  }
  handleClickOpen() {
    this.setState({
      open: true
    });
  }

  render() {
    return (
      <ScreenWithAppBar appbarTitle={"Form list"} enableLeftMenuButton={true}>
        <div className="container">
          <div>
            {true && this.NewFormButton()}
            <Dialog
              fullWidth
              maxWidth="xs"
              onClose={this.handleClose}
              aria-labelledby="customized-dialog-title"
              open={this.state.open}
            >
              <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
                New Form
                <IconButton style={{ float: "right" }} onClick={this.handleClose}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent dividers>
                <NewFormModal {...this.props} />
              </DialogContent>
            </Dialog>
            <ProgramCard data={this.state.data} {...this.props} />
          </div>
        </div>
      </ScreenWithAppBar>
    );
  }
}

export default Forms;
