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

export const DateAndDurationFormElement = ({
  onChange,
  formElement: fe,
  value,
  update,
  duration
}) => {
  const classes = useStyles();

  let durationValue = JSON.parse(fe.keyValues[1].value);
  const [values, setValue] = React.useState(durationValue[0]);
  const today = moment();
  let [date1, setDate] = React.useState(today);

  let [years1, setYears] = React.useState("");
  // const [months, setMonths] = React.useState("");
  // const [weeks, setWeeks] = React.useState("");
  // const [days, setDays] = React.useState("");
  // const [hours, setHours] = React.useState("");

  //  let years;
  //  let durationDays;
  //  let durationWeek;
  //  let durationMonth;
  //  let durationHours;
  //  durationHours = `${dateB.diff(dateC, 'hours')}`;
  //  durationDays = `${dateB.diff(dateC, 'days')}`;
  //  durationWeek = `${dateB.diff(dateC, 'weeks')}`;
  //  durationMonth = `${dateB.diff(dateC, 'months')}`;
  //  setMonths(durationMonth);
  //  setWeeks(durationWeek);
  //  setDays(durationDays);
  //  setHours(durationHours);

  // let years;
  const _onChange = dateValue => {
    const dateB = moment();
    const dateC = moment(dateValue);
    update(dateC);

    let years = `${dateB.diff(dateC, values)}`;
    setYears(years);
    setDate(dateValue);
  };

  const _onYearsChange = duration => {
    let date = today.subtract(duration.target.value, values);
    setDate(date);
    setYears(duration.target.value);
  };

  const handleChange = event => {
    setValue(event.target.value);
  };

  // rconst duration;

  return (
    <FormControl style={{ width: "100%" }}>
      <FormLabel>{fe.display || fe.name}</FormLabel>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          autoOk
          label="Select Date"
          required={fe.mandatory}
          value={date1}
          onChange={dateValue => _onChange(dateValue)}
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
        <RadioGroup row aria-label="gender" name="gender1" value={values} onChange={handleChange}>
          <TextField
            id="standard-number"
            label="Enter Duration"
            type="number"
            InputLabelProps={{
              shrink: true
            }}
            style={{ width: "30%" }}
            value={years1}
            onChange={duration => _onYearsChange(duration)}
          />
          {durationValue.map(item => (
            <FormControlLabel value={item} control={<Radio color="primary" />} label={item} />
          ))}
        </RadioGroup>
      </form>
    </FormControl>
  );
};
