import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Confirm, crudUpdate } from "react-admin";
import Button from "@material-ui/core/Button";

class EnableDisableButton extends Component {
  static propTypes = {
    disabled: PropTypes.bool.isRequired
  };

  state = {
    isOpen: false
  };

  handleClick = () => {
    this.setState({ isOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ isOpen: false });
  };

  handleConfirm = () => {
    const { basePath, crudUpdate, record, resource, disabled } = this.props;
    // HACK: passing request param appended in id.
    crudUpdate(
      `${resource}`,
      `${record.id}/disable?disable=${!disabled}`,
      record,
      record,
      basePath,
      basePath
    );
    this.setState({ isOpen: true });
  };

  render() {
    const { disabled } = this.props;
    const buttonLabel = disabled ? "Enable user" : "Disable user";
    return (
      <Fragment>
        <Button onClick={this.handleClick} color="secondary">
          {buttonLabel}
        </Button>
        <Confirm
          isOpen={this.state.isOpen}
          title={`${buttonLabel} ${this.props.record.username}`}
          content={`Are you sure you want to ${buttonLabel} ?`}
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
)(EnableDisableButton);
