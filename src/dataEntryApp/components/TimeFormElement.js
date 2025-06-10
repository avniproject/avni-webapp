import React from "react";
import { Typography, TextField } from "@mui/material";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { find, isNil } from "lodash";
import { useTranslation } from "react-i18next";
import moment from "moment";

const TimeFormElement = ({ formElement: fe, value, update, validationResults, uuid }) => {
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Typography variant="body1" gutterBottom style={{ width: "50%", marginBottom: 10, color: "rgba(0, 0, 0, 0.54)" }}>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </Typography>
      <TimePicker
        required={fe.mandatory}
        value={!isNil(value) ? moment(value, "HH:mm").toDate() : value}
        ampm={false}
        onChange={value => {
          update(moment(value).format("HH:mm"));
        }}
        placeholder="HH:mm"
        format="HH:mm"
        renderInput={params => (
          <TextField
            {...params}
            error={validationResult && !validationResult.success}
            helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
            style={{ width: "30%" }}
          />
        )}
        slotProps={{
          actionBar: { actions: ["clear"] },
          openPickerButton: { "aria-label": "change time", color: "primary" }
        }}
      />
    </LocalizationProvider>
  );
};

export default TimeFormElement;
