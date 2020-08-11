import React, { Fragment } from "react";
import DateFnsUtils from "@date-io/date-fns";
import { Typography } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardTimePicker } from "@material-ui/pickers";
import { find, isNil } from "lodash";
import { useTranslation } from "react-i18next";
import moment from "moment";

const TimeFormElement = ({ formElement: fe, value, update, validationResults, uuid }) => {
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );
  const toFormatTime = !isNil(value) && moment(value).format("HH:mm");
  const hrs = toFormatTime && toFormatTime.split(":")[0];
  const mins = toFormatTime && toFormatTime.split(":")[1];

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Typography
        variant="body1"
        gutterBottom
        style={{ width: "50%", marginBottom: 10, color: "rgba(0, 0, 0, 0.54)" }}
      >
        {t(fe.display || fe.name)}
        {fe.mandatory ? "*" : ""}
      </Typography>
      <KeyboardTimePicker
        // label={fe.display || fe.name}
        required={fe.mandatory}
        value={!isNil(value) ? new Date().setHours(hrs, mins) : value}
        ampm={false}
        onChange={value => {
          update(value);
        }}
        onError={console.log}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        placeholder="hh:mm"
        style={{ width: "30%" }}
        KeyboardButtonProps={{
          "aria-label": "change time",
          color: "primary"
        }}
      />
    </MuiPickersUtilsProvider>
  );
};

export default TimeFormElement;
