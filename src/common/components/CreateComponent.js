import React from "react";
import Button from "@material-ui/core/Button";
import { isEmpty } from "lodash";

export const CreateComponent = props => {
  return (
    <Button
      color="primary"
      variant="outlined"
      onClick={event => props.onSubmit(event)}
      style={isEmpty(props.styleClass) ? {} : props.styleClass}
      disabled={props.disabledFlag}
      fullWidth={props.fullWidth}
    >
      {props.name.toUpperCase()}
    </Button>
  );
};

CreateComponent.defaultProps = {
  disabledFlag: false,
  name: "CREATE",
  styleClass: {},
  fullWidth: false
};
