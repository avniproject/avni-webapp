import React from "react";
import Button from "@material-ui/core/Button";
import { isEmpty } from "lodash";

export const SaveComponent = props => {
  return (
    <Button
      color="primary"
      variant="contained"
      onClick={event => props.onSubmit(event)}
      style={isEmpty(props.styleClass) ? {} : props.styleClass}
      disabled={props.disabledFlag}
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
