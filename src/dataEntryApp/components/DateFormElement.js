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
import _, { isNil, get, find } from "lodash";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "20ch"
    }
  }
}));

export const DateTimeFormElement = ({
  formElement: fe,
  value,
  update,
  validationResults,
  uuid
}) => {
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDateTimePicker
        autoOk
        ampm={true}
        label={fe.display || fe.name}
        required={fe.mandatory}
        value={value}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
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

const getValue = (keyValues, key) => {
  const keyValue = find(keyValues, keyValue => keyValue.key === key);
  return get(keyValue, "value");
};

export const DateFormElement = ({ formElement: fe, value, update, validationResults, uuid }) => {
  let durationValue = getValue(fe.keyValues, "durationOptions");
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );

  return durationValue ? (
    <DateAndDurationFormElement
      formElement={fe}
      value={value}
      update={update}
      validationResult={validationResult}
    />
  ) : (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        autoOk
        label={fe.display || fe.name}
        required={fe.mandatory}
        value={value}
        onChange={update}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
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
  formElement: fe,
  value,
  update,
  validationResult
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  let durationValue = JSON.parse(getValue(fe.keyValues, "durationOptions"));
  const [units, setUnit] = React.useState(durationValue[0]);
  const today = moment();
  const [date, setDate] = React.useState(value);
  const firstDuration = `${today.diff(value, units ? units : "years")}`;
  const [duration, setduration] = React.useState(firstDuration);
  const onDateChange = dateValue => {
    if (isNil(dateValue)) {
      update(null);
    } else {
      const currentDate = moment();
      const selectedDate = moment(dateValue);
      update(selectedDate);
      const extractDuration = `${currentDate.diff(selectedDate, units)}`;
      setduration(extractDuration);
      setDate(selectedDate);
    }
  };

  const onDurationChange = durationValue => {
    const durationDate = today.subtract(durationValue.target.value, units);
    setDate(durationDate);
    setduration(durationValue.target.value);
    update(durationDate);
  };

  const onChangeUnit = unitsValue => {
    setUnit(unitsValue.target.value);
    const durationDate = today.subtract(duration, unitsValue.target.value);
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
          helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
          error={validationResult && !validationResult.success}
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
        <RadioGroup row aria-label="gender" name="gender1" value={units} onChange={onChangeUnit}>
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
