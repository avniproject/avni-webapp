import { useState } from "react";
import { styled } from "@mui/material/styles";
import { TextField, FormLabel, FormControl } from "@mui/material";
import { isEmpty, find } from "lodash";
import { CompositeDuration } from "avni-models";
import { useTranslation } from "react-i18next";

const StyledForm = styled("div")(({ theme }) => ({
  "& > *": {
    margin: theme.spacing(1),
    width: "20ch"
  }
}));

const DurationFormElement = ({ duration, mandatory, name, update, validationResult }) => {
  const [localVal, setLocalVal] = useState((duration && duration.durationValue) || "");
  const { t } = useTranslation();

  return (
    <TextField
      label={t(duration.durationUnit)}
      required={mandatory}
      name={name}
      type="number"
      value={localVal}
      helperText={validationResult && duration.isEmpty && t(validationResult.messageKey, validationResult.extra)}
      error={validationResult && !validationResult.success && duration.isEmpty}
      onChange={e => {
        const value = e.target.value;
        isEmpty(value) ? setLocalVal("") : setLocalVal(value);
        isEmpty(value) ? update() : update(value);
      }}
    />
  );
};

const CompositeDurationFormElement = ({ formElement: fe, value, update, validationResults, uuid }) => {
  const compositeDuration = value ? CompositeDuration.fromObs(value) : CompositeDuration.fromOpts(fe.durationOptions);
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

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
            update={val => {
              isEmpty(val)
                ? update(compositeDuration.changeValueByUnit(durationUnit, ""))
                : update(compositeDuration.changeValueByUnit(durationUnit, val));
            }}
          />
        ))}
      </StyledForm>
    </FormControl>
  );
};

export default CompositeDurationFormElement;
