import React from "react";
import { FormControl, FormControlLabel, FormGroup, FormLabel } from "@material-ui/core";
import { xor, first, filter } from "lodash";
import Checkbox from "./Checkbox";
import Radio from "./Radio";

export const CodedFormElement = ({
  groupName,
  items,
  isChecked,
  onChange,
  multiSelect,
  ...props
}) => {
  return (
    <FormControl component="fieldset" {...props}>
      <FormLabel component="legend">{groupName}</FormLabel>
      <FormGroup>
        {items.map(item => (
          <FormControlLabel
            key={item.uuid}
            control={
              multiSelect ? (
                <Checkbox
                  checked={isChecked(item)}
                  onChange={() => onChange(xor([item], filter(items, isChecked)))}
                  value={item.uuid}
                />
              ) : (
                <Radio
                  checked={isChecked(item)}
                  onChange={() => onChange(first(xor([item], filter(items, isChecked))))}
                  value={item.uuid}
                />
              )
            }
            label={item.name}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
};
