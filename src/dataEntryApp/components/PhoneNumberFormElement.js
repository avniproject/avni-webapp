import React from "react";
import { useTranslation } from "react-i18next";
import { find, get, isEmpty, isNaN, isNil, size } from "lodash";
import { PhoneNumber } from "avni-models";
import { makeStyles, TextField, Typography } from "@material-ui/core";
import Colors from "../Colors";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const useStyles = makeStyles(theme => ({
  labelStyle: {
    width: "50%",
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.54)"
  },
  errorStyle: {
    color: Colors.ValidationError
  }
}));

export default function PhoneNumberFormElement({ obsHolder, formElement, update, validationResults, uuid }) {
  const classes = useStyles();
  const { mandatory, name, concept, editable } = formElement;
  const observation = obsHolder.findObservation(concept);
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === formElement.questionGroupIndex
  );
  const label = `${t(name)} ${mandatory ? "*" : ""}`;
  const isError = validationResult && !validationResult.success;
  const textColor = isError ? Colors.ValidationError : Colors.DefaultPrimary;
  const phoneNumber = isNil(observation) ? new PhoneNumber() : observation.getValueWrapper();
  const isVerified = phoneNumber.isVerified();
  const isUnverified = get(validationResult, "success", true) && !isVerified && size(phoneNumber.getValue()) === 10;

  const renderVerifyOption = () => {
    const number = phoneNumber.getValue();
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={isVerified}
            onChange={event => update({ phoneNumber: number, isVerified: event.target.checked })}
            name="verified"
            color="primary"
          />
        }
        label={t("verified")}
      />
    );
  };

  const renderUnverifiedMessage = () => {
    return (
      <Typography variant="body1" className={classes.errorStyle}>
        {t("phoneNumberUnverified")}
      </Typography>
    );
  };

  return (
    <div>
      <Typography variant="body1" gutterBottom className={classes.labelStyle}>
        {t(label)}
      </Typography>
      <TextField
        type={"numeric"}
        autoComplete="off"
        required={mandatory}
        name={name}
        value={isNaN(parseInt(phoneNumber.getValue())) ? "" : phoneNumber.getValue()}
        style={{ width: "30%" }}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={isError}
        inputProps={{ style: { color: textColor } }}
        onChange={e => {
          const phoneNumber = e.target.value;
          isEmpty(phoneNumber) ? update({}) : update({ phoneNumber, isVerified: false });
        }}
        disabled={!editable}
      />
      {renderVerifyOption()}
      {isUnverified && renderUnverifiedMessage()}
    </div>
  );
}
