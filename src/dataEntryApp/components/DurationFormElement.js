import React, { Fragment, useState } from "react";
import { TextField, FormLabel, FormControl } from "@material-ui/core";
import { isEmpty } from "lodash";
import { CompositeDuration } from "avni-models";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "20ch"
    }
  }
}));

const DurationFormElement = ({ duration, mandatory, name, update }) => {
  const [localVal, setLocalVal] = useState((duration && duration.durationValue) || "");
  const { t } = useTranslation();
  return (
    <Fragment>
      <TextField
        label={t(duration.durationUnit)}
        required={mandatory}
        name={name}
        type="numeric"
        value={localVal}
        onChange={e => {
          const value = e.target.value;
          isEmpty(value) ? setLocalVal("") : setLocalVal(value);
          isEmpty(value) ? update() : update(value);
        }}
      />
    </Fragment>
  );
};

const CompositeDurationFormElement = ({ formElement: fe, value, update }) => {
  const compositeDuration = value
    ? CompositeDuration.fromObs(value)
    : CompositeDuration.fromOpts(fe.durationOptions);
  const classes = useStyles();

  return (
    <FormControl>
      <FormLabel>{fe.display || fe.name}</FormLabel>
      <form className={classes.root} noValidate autoComplete="off">
        {fe.durationOptions.map((durationUnit, key) => {
          return (
            <DurationFormElement
              key={key}
              mandatory={fe.mandatory}
              name={fe.name + key}
              duration={compositeDuration.findByUnit(durationUnit)}
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
