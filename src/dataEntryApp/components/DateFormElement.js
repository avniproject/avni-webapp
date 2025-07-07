import { useState } from "react";
import { styled } from "@mui/material/styles";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { find, get, isNil } from "lodash";
import { useTranslation } from "react-i18next";
import { dateFormat, dateTimeFormat } from "dataEntryApp/constants";
import { differenceInYears, differenceInMonths, differenceInDays } from "date-fns";

const StyledForm = styled("div")(({ theme }) => ({
  "& > *": {
    margin: theme.spacing(1),
    width: "20ch"
  }
}));

const StyledLabel = styled(Typography)({
  width: "50%",
  marginBottom: 10,
  color: "rgba(0, 0, 0, 0.54)"
});

const StyledTextField = styled(TextField)({
  width: "30%"
});

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
        slotProps={{
          textField: {
            error: validationResult && !validationResult.success,
            helperText: validationResult && t(validationResult.messageKey, validationResult.extra),
            variant: "outlined"
          },
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
        slotProps={{
          textField: {
            error: validationResult && !validationResult.success,
            helperText: validationResult && t(validationResult.messageKey, validationResult.extra),
            inputProps: { disableUnderline: !fe.editable },
            variant: "outlined"
          },
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
  const today = new Date();
  const [date, setDate] = useState(value);
  const firstDuration = value ? String(differenceInYears(today, value)) : "";
  const [duration, setDuration] = useState(firstDuration);

  const onDateChange = dateValue => {
    if (isNil(dateValue)) {
      update(null);
      setDate(null);
      setDuration("");
    } else {
      update(dateValue);
      const diffFunctions = {
        years: differenceInYears,
        months: differenceInMonths,
        days: differenceInDays
      };
      const extractDuration = String(diffFunctions[units](today, dateValue));
      setDuration(extractDuration);
      setDate(dateValue);
    }
  };

  const onDurationChange = durationValue => {
    const newDuration = durationValue.target.value;
    if (newDuration === "") {
      setDuration("");
      setDate(null);
      update(null);
    } else {
      const diffFunctions = {
        years: (date, amount) => new Date(date.setFullYear(date.getFullYear() - amount)),
        months: (date, amount) => new Date(date.setMonth(date.getMonth() - amount)),
        days: (date, amount) => new Date(date.setDate(date.getDate() - amount))
      };
      const durationDate = diffFunctions[units](new Date(today), Number(newDuration));
      setDate(durationDate);
      setDuration(newDuration);
      update(durationDate);
    }
  };

  const onChangeUnit = unitsValue => {
    const newUnit = unitsValue.target.value;
    setUnit(newUnit);
    if (duration !== "") {
      const diffFunctions = {
        years: (date, amount) => new Date(date.setFullYear(date.getFullYear() - amount)),
        months: (date, amount) => new Date(date.setMonth(date.getMonth() - amount)),
        days: (date, amount) => new Date(date.setDate(date.getDate() - amount))
      };
      const durationDate = diffFunctions[newUnit](new Date(today), Number(duration));
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
          slotProps={{
            textField: {
              error: validationResult && !validationResult.success,
              helperText: validationResult && t(validationResult.messageKey, validationResult.extra),
              inputProps: { disableUnderline: !fe.editable },
              variant: "outlined"
            },
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
