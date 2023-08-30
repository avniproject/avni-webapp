import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { crudUpdate } from "react-admin";
import Button from "@material-ui/core/Button";
import PasswordDialog from "./PasswordDialog";
import httpClient from "../../common/utils/httpClient";
import { get } from "lodash";

class ResetPasswordButton extends Component {
  state = {
    isOpen: false,
    error: null
  };

  handleClick = () => {
    this.setState({ isOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ isOpen: false });
  };

  handleConfirm = async password => {
    const { record } = this.props;

    try {
      await httpClient.putJson("/user/resetPassword", {
        userId: record.id,
        password: password
      });
      this.setState({ isOpen: false });
    } catch (e) {
      this.setState({
        error: get(e, "response.data.message", "Unknown error. Could not set password")
      });
    }
  };

  render() {
    const buttonLabel = "Reset password";
    return (
      <Fragment>
        <Button onClick={this.handleClick} style={{ color: "#3f51b5" }}>
          {buttonLabel}
        </Button>
        <PasswordDialog
          open={this.state.isOpen}
          username={this.props.record.username}
          onConfirm={this.handleConfirm}
          onClose={this.handleDialogClose}
          serverError={this.state.error}
        />
      </Fragment>
    );
  }
}

export default connect(
  null,
  { crudUpdate }
)(ResetPasswordButton);
