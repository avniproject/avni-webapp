import React from "react";
import { withStyles } from "@mui/styles";
import { TextField } from "@mui/material";

const styles = {
  input: {
    height: 0
  }
};

const InputField = ({ type, value, onChange, ...props }) => {
  const getValue = () => {
    if (type === "number") {
      return value === 0 ? null : value;
    }
    return value;
  };

  return (
    <TextField
      variant="outlined"
      type={type || "text"}
      value={getValue()}
      onChange={onChange}
      InputProps={{ classes: { input: props.classes.input } }}
    />
  );
};

export default withStyles(styles)(InputField);
