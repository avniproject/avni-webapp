import React, { Component } from "react";
import { connect } from "react-redux";
import { crudCreate, SaveButton } from "react-admin";

const saveLocation = (values, basePath, redirectTo) =>
  crudCreate(
    "locations",
    [
      {
        name: values.title,
        level: values.level,
        type: values.type || values.typeString,
        parents: [{ id: values.parentId }]
      }
    ],
    basePath,
    redirectTo
  );

class LocationSaveButtonView extends Component {
  handleClick = () => {
    const { basePath, handleSubmit, redirect, saveLocation } = this.props;

    return handleSubmit(values => {
      saveLocation(values, basePath, redirect);
    });
  };

  render() {
    const { handleSubmitWithRedirect, saveLocation, ...props } = this.props;

    return <SaveButton handleSubmitWithRedirect={this.handleClick} {...props} />;
  }
}

export const LocationSaveButton = connect(
  undefined,
  { saveLocation }
)(LocationSaveButtonView);
