import { FormControl, FormLabel, TextField } from "@mui/material";
import React from "react";
import { useStyle } from "../util/FilterStyles";

const TextFilter = ({ label, value, filterCriteria, onFilterChange, isNumeric }) => {
  const classes = useStyle();

  return (
    <FormControl fullWidth className={classes.filter}>
      <FormLabel component="legend">{label}</FormLabel>
      <TextField
        className={classes.textField}
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
    </FormControl>
  );
};
export default TextFilter;
