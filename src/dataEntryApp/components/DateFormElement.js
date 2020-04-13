import React, { Fragment } from "react";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
  KeyboardDatePicker
} from "@material-ui/pickers";

import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  FormLabel
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "20ch"
    }
  }
}));

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
        // disablePast
        format="dd/MM/yyyy HH:mm"
        style={{ width: "30%" }}
      />
    </MuiPickersUtilsProvider>
  );
};

export const DateFormElement = ({ formElement: fe, value, update }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        autoOk
        label={fe.display || fe.name}
        required={fe.mandatory}
        value={value}
        onChange={update}
        onError={console.log}
        format="dd/MM/yyyy"
        style={{ width: "30%" }}
      />
    </MuiPickersUtilsProvider>
  );
};

export const DateAndDurationFormElement = ({ formElement: fe, value, update }) => {
  const classes = useStyles();

  return (
    <FormControl style={{ width: "80%" }}>
      <FormLabel>{fe.display || fe.name}</FormLabel>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          autoOk
          label="Select Date"
          required={fe.mandatory}
          value={value}
          onChange={update}
          onError={console.log}
          format="dd/MM/yyyy"
          style={{ width: "30%" }}
        />
      </MuiPickersUtilsProvider>
      <div>
        <FormLabel>OR</FormLabel>
      </div>
      <form className={classes.root} noValidate autoComplete="off">
        <TextField id="standard-basic" label="Enter Duration" />
        <RadioGroup aria-label="position" name="position" defaultValue="end">
          <FormControlLabel value="end" control={<Radio color="primary" />} label="End" />
        </RadioGroup>
      </form>
    </FormControl>
  );
};
