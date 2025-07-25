import { Button } from "@mui/material";
import { isEmpty } from "lodash";

export const CreateComponent = ({
  onSubmit,
  disabledFlag = false,
  name = "CREATE",
  styleClass = {},
  fullWidth = false
}) => {
  return (
    <Button
      color="primary"
      variant="outlined"
      onClick={event => onSubmit(event)}
      style={isEmpty(styleClass) ? {} : styleClass}
      disabled={disabledFlag}
      fullWidth={fullWidth}
    >
      {name.toUpperCase()}
    </Button>
  );
};
