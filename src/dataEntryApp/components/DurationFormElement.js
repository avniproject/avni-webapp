import React, { Fragment, useState } from "react";
import { FormControlLabel, TextField } from "@material-ui/core";
import { isEmpty } from "lodash";
import { CompositeDuration } from "avni-models";

const DurationFormElement = ({ duration, mandatory, name, update }) => {
  const [localVal, setLocalVal] = useState((duration && duration.durationValue) || "");

  return (
    <Fragment>
      <TextField
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
      <span>{duration.durationUnit}</span>
    </Fragment>
  );
};

const CompositeDurationFormElement = ({ formElement: fe, value, update }) => {
  const compositeDuration = value
    ? CompositeDuration.fromObs(value)
    : CompositeDuration.fromOpts(fe.durationOptions);

  return (
    <FormControlLabel
      label={fe.display || fe.name}
      control={
        <Fragment>
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
        </Fragment>
      }
    />
  );
};

export default CompositeDurationFormElement;
