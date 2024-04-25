import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import { KeyboardDatePicker, KeyboardDateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment/moment";
import { find, get, isNil } from "lodash";
import { useTranslation } from "react-i18next";
import { dateFormat, dateTimeFormat } from "dataEntryApp/constants";

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "20ch"
    }
  },
  lableStyle: {
    width: "50%",
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.54)"
  }
}));

export const DateTimeFormElement = ({ formElement: fe, value, update, validationResults, uuid }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Typography variant="body1" gutterBottom className={classes.lableStyle}>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </Typography>
      <KeyboardDateTimePicker
        autoOk
        ampm={true}
        required={fe.mandatory}
        value={value}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        onChange={update}
        placeholder={dateTimeFormat}
        format={dateTimeFormat}
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
  const classes = useStyles();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  return durationValue ? (
    <DateAndDurationFormElement formElement={fe} value={value} update={update} validationResult={validationResult} />
  ) : (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Typography variant="body1" gutterBottom className={classes.lableStyle}>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </Typography>
      <KeyboardDatePicker
        id={fe.name.replaceAll(" ", "-")}
        required={fe.mandatory}
        value={value}
        onChange={update}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        placeholder={dateFormat}
        format={dateFormat}
        style={{ width: "30%" }}
        KeyboardButtonProps={{
          "aria-label": "change date",
          color: "primary"
        }}
        disabled={!fe.editable}
        InputProps={{ disableUnderline: !fe.editable }}
      />
    </MuiPickersUtilsProvider>
  );
};

export const DateAndDurationFormElement = ({ formElement: fe, value, update, validationResult }) => {
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
      <FormLabel>{t(fe.name)}</FormLabel>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Typography variant="body1" gutterBottom className={classes.lableStyle}>
          {`${t("Select Date")}${fe.mandatory ? "*" : ""}`}
        </Typography>
        <KeyboardDatePicker
          id={fe.name.replaceAll(" ", "-")}
          autoOk
          required={fe.mandatory}
          value={date}
          onChange={dateValue => onDateChange(dateValue)}
          helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
          error={validationResult && !validationResult.success}
          placeholder={dateFormat}
          format={dateFormat}
          style={{ width: "30%" }}
          KeyboardButtonProps={{
            "aria-label": "change date",
            color: "primary"
          }}
          disabled={!fe.editable}
          InputProps={{ disableUnderline: !fe.editable }}
        />
      </MuiPickersUtilsProvider>
      <div>
        <FormLabel>OR</FormLabel>
      </div>
      <form>
        <Typography variant="body1" gutterBottom className={classes.lableStyle}>
          {`${t("Enter Duration")}${fe.mandatory ? "*" : ""}`}
        </Typography>
        <RadioGroup row aria-label="gender" name="gender1" value={units} onChange={onChangeUnit}>
          <TextField
            id="standard-number"
            type="number"
            InputLabelProps={{
              shrink: true
            }}
            style={{ width: "30%" }}
            value={duration}
            onChange={durationValue => onDurationChange(durationValue)}
          />
          {durationValue.map(item => (
            <FormControlLabel value={item} style={{ marginLeft: 20 }} control={<Radio color="primary" />} label={t(item)} />
          ))}
        </RadioGroup>
      </form>
    </FormControl>
  );
};
