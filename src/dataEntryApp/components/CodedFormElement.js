import React from "react";
import { FormControl, FormControlLabel, FormGroup, FormLabel } from "@material-ui/core";
import { xor, first, filter } from "lodash";
import Checkbox from "./Checkbox";
import Radio from "./Radio";
import Box from "@material-ui/core/Box";
export const CodedFormElement = ({
  groupName,
  items,
  isChecked,
  onChange,
  multiSelect,
  ...props
}) => {
  return (
    <FormControl component="fieldset" {...props} style={{ width: "80%" }}>
      <FormLabel component="legend">{groupName}</FormLabel>
      <FormGroup>
        <Box display="flex" flexWrap="wrap" alignContent="flex-start">
          {items.map(item => (
            <Box width="20%">
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
              />{" "}
            </Box>
          ))}
        </Box>
      </FormGroup>
    </FormControl>
  );
};
