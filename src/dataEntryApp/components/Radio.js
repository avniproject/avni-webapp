import React from "react";
import { Checkbox } from "@material-ui/core";
import RadioCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import RadioIcon from "@material-ui/icons/RadioButtonUnchecked";

export default props => (
  <Checkbox
    {...props}
    icon={<RadioIcon fontSize="small" />}
    checkedIcon={<RadioCheckedIcon fontSize="small" color="primary" />}
  />
);
