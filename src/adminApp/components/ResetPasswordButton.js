import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { crudUpdate } from "react-admin";
import Button from "@material-ui/core/Button";
import PasswordDialog from "./PasswordDialog";

class ResetPasswordButton extends Component {
  state = {
    isOpen: false
  };

  handleClick = () => {
    this.setState({ isOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ isOpen: false });
  };

  handleConfirm = password => {
    const { basePath, crudUpdate, record, resource } = this.props;
    // HACK: passing request param appended in id.
    crudUpdate(
      `${resource}`,
      `resetPassword`,
      { userId: record.id, password: password },
      record,
      basePath,
      basePath
    );
    this.setState({ isOpen: true });
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
        />
      </Fragment>
    );
  }
}

export default connect(
  null,
  { crudUpdate }
)(ResetPasswordButton);
