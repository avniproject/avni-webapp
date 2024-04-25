import React from "react";
import { Checkbox } from "@material-ui/core";

export default props => <Checkbox {...props} color={props.disabled ? "default" : "primary"} />;
