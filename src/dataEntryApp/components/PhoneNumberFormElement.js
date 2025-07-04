import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { find, get, isEmpty, isNaN, isNil, size } from "lodash";
import { PhoneNumber } from "avni-models";
import { TextField, Typography, FormControlLabel, Checkbox } from "@mui/material";
import Colors from "../Colors";

const StyledLabel = styled(Typography)(({ theme }) => ({
  width: "50%",
  marginBottom: theme.spacing(1),
  color: "rgba(0, 0, 0, 0.54)"
}));

const StyledError = styled(Typography)({
  color: Colors.ValidationError
});

const StyledTextField = styled(TextField)(({ textColor }) => ({
  width: "30%",
  "& .MuiInputBase-input": {
    color: textColor
  }
}));

export default function PhoneNumberFormElement({ obsHolder, formElement, update, validationResults, uuid }) {
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
    return <StyledError variant="body1">{t("phoneNumberUnverified")}</StyledError>;
  };

  return (
    <div>
      <StyledLabel variant="body1">{t(label)}</StyledLabel>
      <StyledTextField
        type="numeric"
        autoComplete="off"
        required={mandatory}
        name={name}
        value={isNaN(parseInt(phoneNumber.getValue())) ? "" : phoneNumber.getValue()}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={isError}
        textColor={textColor}
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
