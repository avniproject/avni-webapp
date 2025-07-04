import { styled } from "@mui/material/styles";
import { TextField, Typography } from "@mui/material";
import { find, isEmpty, isNil, toNumber } from "lodash";
import { useTranslation } from "react-i18next";
import Colors from "../Colors";

const StyledContainer = styled("div")({
  width: "50%"
});

const StyledGridContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "50%"
});

const StyledLabel = styled(Typography)({
  width: "50%",
  marginBottom: 10,
  color: "rgba(0, 0, 0, 0.54)"
});

const StyledGridLabel = styled(Typography)({
  color: "rgba(0, 0, 0, 0.54)",
  flex: 0.5,
  marginRight: "15px",
  borderRight: "1px solid rgba(0, 0, 0, 0.12)"
});

const StyledTextField = styled(TextField)({
  width: "30%"
});

export default ({ formElement: fe, value, update, validationResults, uuid, isGrid }) => {
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  const error = () => {
    if (validationResult && !validationResult.success) {
      return true;
    }
    if (fe.concept.isAbnormal(value)) {
      return !isNil(value);
    }
    return false;
  };

  const textColor = error() ? Colors.ValidationError : fe.editable ? Colors.DefaultPrimary : Colors.DefaultDisabled;

  const rangeText = (lowNormal, hiNormal) => {
    let rangeText = null;
    if (!isNil(lowNormal)) {
      if (!isNil(hiNormal)) {
        rangeText = `${lowNormal} - ${hiNormal}`;
      } else {
        rangeText = `>=${lowNormal}`;
      }
    } else if (!isNil(hiNormal)) {
      rangeText = `<=${hiNormal}`;
    }
    return rangeText || "";
  };

  return isGrid ? (
    <StyledGridContainer>
      <StyledGridLabel variant="body1" sx={{ mb: 0 }}>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
        {!isNil(fe.concept.unit) && !isEmpty(fe.concept.unit.trim()) ? ` (${fe.concept.unit})` : ""}
        {rangeText(fe.concept.lowNormal, fe.concept.hiNormal)}
      </StyledGridLabel>
      <StyledTextField
        type="number"
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={value == null ? "" : value}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={error()}
        sx={{ input: { color: textColor }, "& .MuiInput-underline": { textDecoration: fe.editable ? "underline" : "none" } }}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update(null) : update(v.replace(/[^0-9.]/g, ""));
        }}
        disabled={!fe.editable}
        onBlur={() => (isNil(value) ? update(null) : update(toNumber(value)))}
      />
    </StyledGridContainer>
  ) : (
    <StyledContainer>
      <StyledLabel variant="body1" sx={{ mb: 1 }}>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
        {!isNil(fe.concept.unit) && !isEmpty(fe.concept.unit.trim()) ? ` (${fe.concept.unit})` : ""}
        {rangeText(fe.concept.lowNormal, fe.concept.hiNormal)}
      </StyledLabel>
      <StyledTextField
        type="number"
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={value == null ? "" : value}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={error()}
        sx={{ input: { color: textColor }, "& .MuiInput-underline": { textDecoration: fe.editable ? "underline" : "none" } }}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update(null) : update(v.replace(/[^0-9.]/g, ""));
        }}
        disabled={!fe.editable}
        onBlur={() => (isNil(value) ? update(null) : update(toNumber(value)))}
      />
    </StyledContainer>
  );
};
