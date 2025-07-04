import { styled } from "@mui/material/styles";
import { TextField, Typography } from "@mui/material";
import { find, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { HelpText } from "../../common/components/HelpText";

const StyledContainer = styled("div")(({ isGrid }) => ({
  display: isGrid ? "flex" : "block",
  flexDirection: isGrid ? "row" : undefined,
  alignItems: isGrid ? "center" : undefined,
  width: isGrid ? "50%" : undefined
}));

const StyledTypography = styled(Typography)(({ theme, isGrid, hasHelpText }) => ({
  width: !isGrid ? "50%" : undefined,
  marginBottom: !isGrid && !hasHelpText ? 8 : 0, // Converted from sx={{ mb: 1 }} (1 * 8px = 8px)
  color: "rgba(0, 0, 0, 0.54)",
  flex: isGrid ? 0.5 : undefined,
  marginRight: isGrid ? "15px" : undefined,
  borderRight: isGrid ? "1px solid rgba(0, 0, 0, 0.12)" : undefined
}));

const StyledTextField = styled(TextField)({
  width: "30%"
});

export default ({ formElement: fe, value, update, validationResults, uuid, isGrid, helpText }) => {
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  return (
    <StyledContainer isGrid={isGrid}>
      <StyledTypography variant="body1" isGrid={isGrid} hasHelpText={!isEmpty(helpText)}>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </StyledTypography>
      <HelpText text={helpText} t={t} />
      <StyledTextField
        multiline={true}
        id={fe.name.replaceAll(" ", "-")}
        type="text"
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={value ? value : ""}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update() : update(v);
        }}
        InputProps={{ disableUnderline: !fe.editable }}
        disabled={!fe.editable}
      />
    </StyledContainer>
  );
};
