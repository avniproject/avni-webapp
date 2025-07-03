import { FormControl, FormLabel, TextField as MuiTextField } from "@mui/material";
import React from "react";
import { Filter, TextField } from "../util/FilterStyles";

const TextFilter = ({ label, value, filterCriteria, onFilterChange, isNumeric }) => {
  return (
    <Filter>
      <FormControl fullWidth>
        <FormLabel component="legend">{label}</FormLabel>
        <TextField>
          <MuiTextField
            inputProps={{
              style: {
                padding: 10
              }
            }}
            variant="outlined"
            value={value}
            onChange={event => onFilterChange(event.target.value)}
            type={isNumeric ? "number" : "text"}
          />
        </TextField>
      </FormControl>
    </Filter>
  );
};
export default TextFilter;