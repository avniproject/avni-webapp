import React, { Fragment } from "react";
import { TextField } from "@material-ui/core";
import { isEmpty } from "lodash";

const SimpleDateFormElement = ({ formElement: fe, type, value, update }) => {
  const [date, setDate] = React.useState(value ? value.toISOString() : "");

  /*TODO:
   * DateFormElement cannot be auto-calculated as of now.
   * Because the two way binding is not implemented.
   *
   * React.useEffect( fun {
   *   if current element not focused {
   *     setDate(value ? value.toISOString() : "")
   *   }
   * }, [value]);
   *
   * */

  return (
    <Fragment>
      <TextField
        label={fe.display || fe.name}
        type={type}
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

export const DateFormElement = props => <SimpleDateFormElement type="date" {...props} />;
export const DateTimeFormElement = props => (
  <SimpleDateFormElement type="datetime-local" {...props} />
);
