import React, { Fragment, useState } from "react";
import { TextField, FormLabel, FormControl } from "@material-ui/core";
import _, { isEmpty, find } from "lodash";
import { CompositeDuration } from "avni-models";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { __esModule } from "react-router-dom/cjs/react-router-dom.min";

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "20ch"
    }
  }
}));

const DurationFormElement = ({ duration, mandatory, name, update, validationResult }) => {
  const [localVal, setLocalVal] = useState((duration && duration.durationValue) || "");

  const { t } = useTranslation();

  return (
    <Fragment>
      <TextField
        label={t(duration.durationUnit)}
        required={mandatory}
        name={name}
        type="number"
        value={localVal}
        helperText={
          validationResult &&
          duration.isEmpty &&
          t(validationResult.messageKey, validationResult.extra)
        }
        error={validationResult && !validationResult.success && duration.isEmpty}
        onChange={e => {
          const value = e.target.value;
          isEmpty(value) ? setLocalVal("") : setLocalVal(value);
          isEmpty(value) ? update() : update(value);
        }}
      />
    </Fragment>
  );
};

const CompositeDurationFormElement = ({
  formElement: fe,
  value,
  update,
  validationResults,
  uuid
}) => {
  const compositeDuration = value
    ? CompositeDuration.fromObs(value)
    : CompositeDuration.fromOpts(fe.durationOptions);
  const classes = useStyles();

  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );

  return (
    <FormControl>
      <FormLabel>{fe.display || fe.name}</FormLabel>
      <form className={classes.root} noValidate autoComplete="off">
        {fe.durationOptions.map((durationUnit, index) => {
          return (
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
          );
        })}
      </form>
    </FormControl>
  );
};

export default CompositeDurationFormElement;
