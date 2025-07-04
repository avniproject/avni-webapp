import { Button } from "@mui/material";
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
