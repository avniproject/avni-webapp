import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { isEmpty } from "lodash";

export const SaveComponent = props => {
  const [saveInProgress, setSaveInProgress] = useState(false);

  const enableSaveButton = () => {
    setSaveInProgress(false);
  };
  const disableSaveButton = () => {
    setSaveInProgress(true);
  };

  const onSubmit = async event => {
    disableSaveButton();
    try {
      await props.onSubmit(event);
    } finally {
      enableSaveButton();
    }
  };

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={onSubmit}
      style={isEmpty(props.styleClass) ? {} : props.styleClass}
      disabled={props.disabledFlag || saveInProgress}
      fullWidth={props.fullWidth}
    >
      <i className="material-icons">save</i>
      {props.name.toUpperCase()}
    </Button>
  );
};

SaveComponent.defaultProps = {
  disabledFlag: false,
  name: "SAVE",
  styleClass: {},
  fullWidth: false
};
