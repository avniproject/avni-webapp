import { Typography } from "@mui/material";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { find, isNil } from "lodash";
import { useTranslation } from "react-i18next";
import { parse, format } from "date-fns";

const TimeFormElement = ({
  formElement: fe,
  value,
  update,
  validationResults,
  uuid
}) => {
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) =>
      formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Typography
        variant="body1"
        sx={{
          mb: 1.25,
          width: "50%",
          color: theme => theme.palette.text.secondary
        }}
      >
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </Typography>
      <TimePicker
        required={fe.mandatory}
        value={!isNil(value) ? parse(value, "HH:mm", new Date()) : null}
        ampm={false}
        onChange={value => update(value ? format(value, "HH:mm") : null)}
        placeholder="HH:mm"
        format="HH:mm"
        slotProps={{
          textField: {
            error: validationResult && !validationResult.success,
            helperText:
              validationResult &&
              t(validationResult.messageKey, validationResult.extra),
            style: { width: "30%" },
            variant: "outlined"
          },
          actionBar: { actions: ["clear"] },
          openPickerButton: { "aria-label": "change time", color: "primary" }
        }}
      />
    </LocalizationProvider>
  );
};

export default TimeFormElement;
