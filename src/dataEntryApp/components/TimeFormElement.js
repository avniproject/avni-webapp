import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardTimePicker } from "@material-ui/pickers";

const TimeFormElement = ({ formElement: fe, value, update }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardTimePicker
        autoOk
        label={fe.display || fe.name}
        required={fe.mandatory}
        value={value}
        onChange={update}
        onError={console.log}
        mask="__:__ _M"
        style={{ width: "30%" }}
        KeyboardButtonProps={{
          "aria-label": "change date",
          color: "primary"
        }}
      />
    </MuiPickersUtilsProvider>
  );
};

export default TimeFormElement;
