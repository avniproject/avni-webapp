import React, { Fragment } from "react";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardTimePicker } from "@material-ui/pickers";
import { find } from "lodash";
import { useTranslation } from "react-i18next";

const TimeFormElement = ({ formElement: fe, value, update, validationResults, uuid }) => {
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardTimePicker
        autoOk
        label={fe.display || fe.name}
        required={fe.mandatory}
        value={value}
        onChange={update}
        onError={console.log}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        mask="__:__ _M"
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
