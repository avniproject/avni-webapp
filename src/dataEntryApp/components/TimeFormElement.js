import React, { Fragment } from "react";
import { TextField } from "@material-ui/core";
import { isEmpty } from "lodash";

const MIN = 60;

const TimeFormElement = ({ formElement: fe, value, update }) => {
  const [time, setTime] = React.useState(value ? value : "");

  /*TODO:
   * TimeFormElement cannot be auto-calculated through rules, as of now.
   * Because the two way binding is not implemented.
   *
   * React.useEffect( fun {
   *   if current element not focused {
   *     setTime(value ? value : "")
   *   }
   * }, [value]);
   *
   * */

  return (
    <Fragment>
      <TextField
        label={fe.display || fe.name}
        required={fe.mandatory}
        name={fe.name}
        fullWidth
        InputLabelProps={{
          shrink: true
        }}
        value={time}
        onChange={e => {
          const value = e.target.value;
          isEmpty(value) ? setTime("") : setTime(value);
          isEmpty(value) ? update() : update(value);
        }}
        type="time"
        inputProps={{ step: 5 * MIN }}
      />
    </Fragment>
  );
};

export default TimeFormElement;
