import { styled } from "@mui/material/styles";
import { TextField, FormLabel, FormControl } from "@mui/material";
import { isEmpty, find } from "lodash";
import { CompositeDuration } from "avni-models";
import { useTranslation } from "react-i18next";

const StyledForm = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: theme.spacing(1),
  "& > *": {
    margin: 0,
    width: "auto",
  },
}));

const DurationFormElement = ({
  duration,
  mandatory,
  name,
  update,
  validationResult,
}) => {
  const { t } = useTranslation();
  const hasError =
    Boolean(validationResult && !validationResult.success) && duration.isEmpty;

  return (
    <TextField
      label={t(duration.durationUnit)}
      required={mandatory}
      name={name}
      type="text"
      slotProps={{
        htmlInput: {
          inputMode: "numeric",
        },
      }}
      value={duration.durationValue || ""}
      helperText={
        hasError && t(validationResult.messageKey, validationResult.extra)
      }
      error={hasError}
      onChange={(e) => {
        const value = e.target.value;
        if (value === "" || /^\d+$/.test(value)) {
          update(value);
        }
      }}
    />
  );
};

const CompositeDurationFormElement = ({
  formElement: fe,
  value,
  update,
  validationResults,
  uuid,
}) => {
  const compositeDuration = value
    ? CompositeDuration.fromObs(value)
    : CompositeDuration.fromOpts(fe.durationOptions || []);
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) =>
      formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex,
  );

  if (!fe.durationOptions || fe.durationOptions.length === 0) {
    return null;
  }

  return (
    <FormControl>
      <FormLabel>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </FormLabel>
      <StyledForm>
        {fe.durationOptions.map((durationUnit, index) => (
          <DurationFormElement
            key={index}
            mandatory={fe.mandatory}
            name={fe.name + index}
            duration={compositeDuration.findByUnit(durationUnit)}
            validationResult={validationResult}
            update={(val) => {
              isEmpty(val)
                ? update(compositeDuration.changeValueByUnit(durationUnit, ""))
                : update(
                    compositeDuration.changeValueByUnit(durationUnit, val),
                  );
            }}
          />
        ))}
      </StyledForm>
    </FormControl>
  );
};

export default CompositeDurationFormElement;
