import React from "react";
import { TextField } from "@material-ui/core";
import { isEmpty } from "lodash";

export default ({ formElement: fe, value, update }) => {
  return (
    <TextField
      label={fe.display || fe.name}
      type={"text"}
      required={fe.mandatory}
      name={fe.name}
      value={value}
      multiline
      fullWidth
      variant="outlined"
      onChange={e => {
        const v = e.target.value;
        isEmpty(v) ? update() : update(v);
      }}
    />
  );
};
