import React, { Fragment, useState } from "react";
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
import moment from "moment/moment";
import { Duration } from "avni-models";
import _, { isEmpty } from "lodash";

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
        KeyboardButtonProps={{
          "aria-label": "change date",
          color: "primary"
        }}
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
        KeyboardButtonProps={{
          "aria-label": "change date",
          color: "primary"
        }}
      />
    </MuiPickersUtilsProvider>
  );
};

export const DateAndDurationFormElement = ({ onChange, formElement: fe, value, update }) => {
  const classes = useStyles();

  let durationValue = JSON.parse(fe.keyValues[1].value);
  const [values, setValue] = React.useState(durationValue[0]);
  const today = moment();
  const [date, setDate] = React.useState(today);
  const [duration, setduration] = React.useState("");
  const onDateChange = dateValue => {
    const currentDate = moment();
    const slectedDate = moment(dateValue);
    update(slectedDate);
    const extractDuration = `${currentDate.diff(slectedDate, values)}`;
    setduration(extractDuration);
    setDate(slectedDate);
  };

  const onDurationChange = durationValue => {
    const durationDate = today.subtract(durationValue.target.value, values);
    setDate(durationDate);
    setduration(durationValue.target.value);
    update(durationDate);
  };

  const onChangeTimeZone = timezoneValue => {
    setValue(timezoneValue.target.value);
    const durationDate = today.subtract(duration, timezoneValue.target.value);
    setDate(durationDate);
    update(durationDate);
  };
  return (
    <FormControl style={{ width: "100%" }}>
      <FormLabel>{fe.display || fe.name}</FormLabel>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          autoOk
          label="Select Date"
          required={fe.mandatory}
          value={date}
          onChange={dateValue => onDateChange(dateValue)}
          onError={console.log}
          format="dd/MM/yyyy"
          style={{ width: "30%" }}
          KeyboardButtonProps={{
            "aria-label": "change date",
            color: "primary"
          }}
        />
      </MuiPickersUtilsProvider>
      <div>
        <FormLabel>OR</FormLabel>
      </div>
      <form>
        <RadioGroup
          row
          aria-label="gender"
          name="gender1"
          value={values}
          onChange={onChangeTimeZone}
        >
          <TextField
            id="standard-number"
            label="Enter Duration"
            type="number"
            InputLabelProps={{
              shrink: true
            }}
            style={{ width: "30%" }}
            value={duration}
            onChange={durationValue => onDurationChange(durationValue)}
          />
          {durationValue.map(item => (
            <FormControlLabel value={item} control={<Radio color="primary" />} label={item} />
          ))}
        </RadioGroup>
      </form>
    </FormControl>
  );
};
