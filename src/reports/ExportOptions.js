import { FormControl, FormLabel } from "@material-ui/core";
import _ from "lodash";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "../dataEntryApp/components/Radio";
import React from "react";

export const ExportOptions = ({ options, label, selectedOption, onChange }) => {
  return (
    <div>
      <FormControl component="fieldset">
        {!_.isEmpty(options) && <FormLabel component="legend">{label}</FormLabel>}
        <FormGroup row>
          {options.map(option => (
            <FormControlLabel
              key={option.uuid}
              control={
                <Radio
                  checked={option.uuid === selectedOption.uuid}
                  onChange={() => onChange(option)}
                  value={option.name}
                />
              }
              label={option.name}
            />
          ))}
        </FormGroup>
      </FormControl>
    </div>
  );
};
