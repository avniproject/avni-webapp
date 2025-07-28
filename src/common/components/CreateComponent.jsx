import { Button } from "@mui/material";
import { isEmpty } from "lodash";

export const CreateComponent = ({
  onSubmit,
  disabledFlag = false,
  name = "CREATE",
  styles = {},
  fullWidth = false
}) => {
  return (
    <Button
      color="primary"
      variant="outlined"
      onClick={event => onSubmit(event)}
      style={isEmpty(styles) ? {} : styles}
      disabled={disabledFlag}
      fullWidth={fullWidth}
    >
      {name.toUpperCase()}
    </Button>
  );
};
