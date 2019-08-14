import React, { Fragment } from "react";
import { TextField } from "@material-ui/core";
import { isNaN, isEmpty } from "lodash";

export default ({ formElement: fe, value, update }) => {
  return (
    <Fragment>
      <TextField
        label={fe.display || fe.name}
        type={"numeric"}
        required={fe.mandatory}
        name={fe.name}
        value={value}
        fullWidth
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) || isNaN(+v) ? update() : update(+v);
        }}
      />
    </Fragment>
  );
};
