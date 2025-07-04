import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import moment from "moment/moment";
import { find, get, isNil } from "lodash";
import { useTranslation } from "react-i18next";
import { dateFormat, dateTimeFormat } from "dataEntryApp/constants";

const StyledForm = styled("div")(({ theme }) => ({
  "& > *": {
    margin: theme.spacing(1),
    width: "20ch"
  }
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
  width: "50%",
  marginBottom: 10,
  color: "rgba(0, 0, 0, 0.54)"
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "30%"
}));

const StyledRadioLabel = styled(FormControlLabel)(({ theme }) => ({
  marginLeft: theme.spacing(2.5)
}));

export const DateTimeFormElement = ({ formElement: fe, value, update, validationResults, uuid }) => {
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledLabel variant="body1">
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </StyledLabel>
      <DateTimePicker
        autoOk
        ampm={true}
        required={fe.mandatory}
        value={value}
        onChange={update}
        placeholder={dateTimeFormat}
        format={dateTimeFormat}
        renderInput={params => (
          <StyledTextField
            {...params}
            error={validationResult && !validationResult.success}
            helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
          />
        )}
        slotProps={{
          actionBar: { actions: ["clear"] },
          openPickerButton: { "aria-label": "change date", color: "primary" }
        }}
      />
    </LocalizationProvider>
  );
};

const getValue = (keyValues, key) => {
  const keyValue = find(keyValues, keyValue => keyValue.key === key);
  return get(keyValue, "value");
};

export const DateFormElement = ({ formElement: fe, value, update, validationResults, uuid }) => {
  const { t } = useTranslation();
  const durationValue = getValue(fe.keyValues, "durationOptions");
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  return durationValue ? (
    <DateAndDurationFormElement formElement={fe} value={value} update={update} validationResult={validationResult} />
  ) : (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledLabel variant="body1">
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </StyledLabel>
      <DatePicker
        id={fe.name.replaceAll(" ", "-")}
        required={fe.mandatory}
        value={value}
        onChange={update}
        placeholder={dateFormat}
        format={dateFormat}
        disabled={!fe.editable}
        renderInput={params => (
          <StyledTextField
            {...params}
            error={validationResult && !validationResult.success}
            helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
            inputProps={{ ...params.inputProps, disableUnderline: !fe.editable }}
          />
        )}
        slotProps={{
          actionBar: { actions: ["clear"] },
          openPickerButton: { "aria-label": "change date", color: "primary" }
        }}
      />
    </LocalizationProvider>
  );
};

export const DateAndDurationFormElement = ({ formElement: fe, value, update, validationResult }) => {
  const { t } = useTranslation();
  const durationValue = JSON.parse(getValue(fe.keyValues, "durationOptions"));
  const [units, setUnit] = useState(durationValue[0]);
  const today = moment();
  const [date, setDate] = useState(value);
  const firstDuration = `${today.diff(value, units || "years")}`;
  const [duration, setDuration] = useState(firstDuration);

  const onDateChange = dateValue => {
    if (isNil(dateValue)) {
      update(null);
      setDate(null);
      setDuration("");
    } else {
      const currentDate = moment();
      const selectedDate = moment(dateValue);
      update(selectedDate);
      const extractDuration = `${currentDate.diff(selectedDate, units)}`;
      setDuration(extractDuration);
      setDate(selectedDate);
    }
  };

  const onDurationChange = durationValue => {
    const newDuration = durationValue.target.value;
    if (newDuration === "") {
      setDuration("");
      setDate(null);
      update(null);
    } else {
      const durationDate = today.clone().subtract(newDuration, units);
      setDate(durationDate);
      setDuration(newDuration);
      update(durationDate);
    }
  };

  const onChangeUnit = unitsValue => {
    const newUnit = unitsValue.target.value;
    setUnit(newUnit);
    if (duration !== "") {
      const durationDate = today.clone().subtract(duration, newUnit);
      setDate(durationDate);
      update(durationDate);
    }
  };

  return (
    <FormControl sx={{ width: "100%" }}>
      <FormLabel>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </FormLabel>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <StyledLabel variant="body1">{`${t("Select Date")}${fe.mandatory ? "*" : ""}`}</StyledLabel>
        <DatePicker
          id={fe.name.replaceAll(" ", "-")}
          autoOk
          required={fe.mandatory}
          value={date}
          onChange={onDateChange}
          placeholder={dateFormat}
          format={dateFormat}
          disabled={!fe.editable}
          renderInput={params => (
            <StyledTextField
              {...params}
              error={validationResult && !validationResult.success}
              helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
              inputProps={{ ...params.inputProps, disableUnderline: !fe.editable }}
            />
          )}
          slotProps={{
            actionBar: { actions: ["clear"] },
            openPickerButton: { "aria-label": "change date", color: "primary" }
          }}
        />
      </LocalizationProvider>
      <FormLabel sx={{ mt: 1 }}>OR</FormLabel>
      <StyledForm>
        <StyledLabel variant="body1">{`${t("Enter Duration")}${fe.mandatory ? "*" : ""}`}</StyledLabel>
        <RadioGroup row aria-label="duration-unit" name="duration-unit" value={units} onChange={onChangeUnit}>
          <StyledTextField
            id="standard-number"
            type="number"
            InputLabelProps={{ shrink: true }}
            value={duration}
            onChange={onDurationChange}
            label={t(units)}
          />
          {durationValue.map(item => (
            <StyledRadioLabel key={item} value={item} control={<Radio color="primary" />} label={t(item)} />
          ))}
        </RadioGroup>
      </StyledForm>
    </FormControl>
  );
};
