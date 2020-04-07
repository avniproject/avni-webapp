import React, { Fragment, useState } from "react";
import { FormControlLabel, TextField, FormLabel, FormControl } from "@material-ui/core";
import { isEmpty } from "lodash";
import { CompositeDuration } from "avni-models";
import { useTranslation } from "react-i18next";

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
        InputLabelProps={{
          shrink: true
        }}
        value={localVal}
        onChange={e => {
          const value = e.target.value;
          isEmpty(value) ? setLocalVal("") : setLocalVal(value);
          isEmpty(value) ? update() : update(value);
        }}
      />
      {/* <span>{duration.durationUnit}</span> */}
    </Fragment>
  );
};

const CompositeDurationFormElement = ({ formElement: fe, value, update }) => {
  const compositeDuration = value
    ? CompositeDuration.fromObs(value)
    : CompositeDuration.fromOpts(fe.durationOptions);

  return (
    <FormControl style={{ width: "30%" }}>
      <FormLabel>{fe.display || fe.name}</FormLabel>
      <Fragment>
        {fe.durationOptions.map((durationUnit, key) => {
          return (
            <DurationFormElement
              key={key}
              mandatory={fe.mandatory}
              name={fe.name + key}
              style={{ height: "10%" }}
              duration={compositeDuration.findByUnit(durationUnit)}
              update={val => {
                isEmpty(val)
                  ? update(compositeDuration.changeValueByUnit(durationUnit, ""))
                  : update(compositeDuration.changeValueByUnit(durationUnit, val));
              }}
            />
          );
        })}
      </Fragment>
    </FormControl>
  );
};

export default CompositeDurationFormElement;
