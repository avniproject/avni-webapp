import React, { Fragment } from "react";
import { TextField } from "@material-ui/core";
import { isNil, isEmpty } from "lodash";

export default ({ formElement: fe, value, update }) => {
  const [date, setDate] = React.useState(value ? value.toISOString().substr(0, 10) : "");

  /*TODO:
   * DateFormElement cannot be auto-calculated as of now.
   * Because the two way binding is not implemented.
   *
   * React.useEffect( fun {
   *   if current element not focused {
   *     setDate(value ? value.toISOString().substr(0, 10) : "")
   *   }
   * }, [value]);
   *
   * */

  return (
    <Fragment>
      <TextField
        label={fe.display || fe.name}
        type={"date"}
        required={fe.mandatory}
        name={fe.name}
        fullWidth
        InputLabelProps={{
          shrink: true
        }}
        value={date}
        onChange={e => {
          const value = e.target.value;
          isEmpty(value) ? setDate("") : setDate(value);
          isEmpty(value) ? update() : update(value);
        }}
      />
    </Fragment>
  );
};
