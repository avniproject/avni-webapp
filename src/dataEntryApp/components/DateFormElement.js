import React, { Fragment } from "react";
import { TextField } from "@material-ui/core";
import { isEmpty } from "lodash";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from "@material-ui/pickers";

export const DateTimeFormElement = ({ formElement: fe, value, update }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDateTimePicker
        autoOk
        ampm={true}
        label={fe.display || fe.name}
        required={fe.mandatory}
        value={value}
        onChange={update}
        onError={console.log}
        disablePast
        format="dd/MM/yyyy HH:mm"
        // style={{ width: "30%" }}
      />
    </MuiPickersUtilsProvider>
  );
};

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
        style={{ width: "30%" }}
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
