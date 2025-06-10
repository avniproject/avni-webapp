import React from "react";
import { Checkbox } from "@mui/material";
import { RadioButtonChecked, RadioButtonUnchecked } from "@mui/icons-material";

export default props => (
  <Checkbox
    {...props}
    icon={<RadioButtonUnchecked fontSize="small" />}
    checkedIcon={<RadioButtonChecked fontSize="small" color={props.disabled ? "default" : "primary"} />}
  />
);
