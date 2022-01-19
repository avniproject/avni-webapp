import React from "react";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  input: {
    height: 0
  }
};

const InputField = props => {
  return <TextField InputProps={{ classes: { input: props.classes.input } }} {...props} />;
};

export default withStyles(styles)(InputField);
