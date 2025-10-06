import { styled } from "@mui/material/styles";
import { TextField } from "@mui/material";
import { isEmpty, find } from "lodash";
import { useTranslation } from "react-i18next";

const StyledTextField = styled(TextField)({
  width: "30%",
});

export default ({
  formElement: fe,
  value,
  update,
  validationResults,
  uuid,
}) => {
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) =>
      formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex,
  );

  return (
    <StyledTextField
      label={t(fe.name)}
      type={"text"}
      required={fe.mandatory}
      name={fe.name}
      value={value}
      multiline
      fullWidth
      variant="outlined"
      helperText={
        validationResult &&
        t(validationResult.messageKey, validationResult.extra)
      }
      error={validationResult && !validationResult.success}
      onChange={(e) => {
        const v = e.target.value;
        isEmpty(v) ? update() : update(v);
      }}
      disabled={!fe.editable}
      InputProps={{ disableUnderline: !fe.editable }}
    />
  );
};
