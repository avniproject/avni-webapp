import { FormLabel } from "@mui/material";

import _ from "lodash";

export const ValidationError = ({ validationError }) => {
  return !_.isEmpty(validationError) ? (
    <FormLabel
      error
      style={{
        marginTop: "10px",
        fontSize: "15px"
      }}
    >
      {validationError.message}
    </FormLabel>
  ) : null;
};
