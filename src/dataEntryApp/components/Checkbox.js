import React from "react";
import { Checkbox } from "@mui/material";

export default props => <Checkbox {...props} color={props.disabled ? "default" : "primary"} />;
