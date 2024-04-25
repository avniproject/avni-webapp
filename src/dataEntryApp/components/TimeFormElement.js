import React from "react";
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
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Typography variant="body1" gutterBottom style={{ width: "50%", marginBottom: 10, color: "rgba(0, 0, 0, 0.54)" }}>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </Typography>
      <KeyboardTimePicker
        required={fe.mandatory}
        value={!isNil(value) ? moment(value, "HH:mm").toDate() : value}
        ampm={false}
        onChange={value => {
          update(moment(value).format("HH:mm"));
        }}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        placeholder="HH:mm"
        style={{ width: "30%" }}
        KeyboardButtonProps={{
          "aria-label": "change time",
          color: "primary"
        }}
        format={"HH:mm"}
      />
    </MuiPickersUtilsProvider>
  );
};

export default TimeFormElement;
