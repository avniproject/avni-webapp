import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Select from "react-select";
import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyle = makeStyles(theme => ({
  filter: {
    marginBottom: theme.spacing(5)
  }
}));

const SelectFilter = ({
  label,
  options,
  filter,
  isMulti = false,
  filterCriteria,
  onFilterChange
}) => {
  const classes = useStyle();
  return (
    <FormControl fullWidth className={classes.filter}>
      <FormLabel component="legend">{label}</FormLabel>
      <Select
        isClearable
        isSearchable
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
