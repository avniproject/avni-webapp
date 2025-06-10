import { makeStyles } from "@mui/styles";
import { FormControl, FormLabel } from "@mui/material";
import Select from "react-select";
import React from "react";

const useStyle = makeStyles(theme => ({
  filter: {
    marginBottom: theme.spacing(5)
  }
}));

const SelectFilter = ({ label, options, filter, isMulti = false, filterCriteria, onFilterChange, isClearable = true }) => {
  const classes = useStyle();
  return (
    <FormControl fullWidth className={classes.filter}>
      <FormLabel component="legend">{label}</FormLabel>
      <Select
        isClearable={isClearable}
        maxMenuHeight={120}
        isMulti={isMulti}
        value={filterCriteria[filter]}
        options={options}
        style={{ width: "auto" }}
        onChange={event => onFilterChange(filter, event)}
      />
    </FormControl>
  );
};
export default SelectFilter;
