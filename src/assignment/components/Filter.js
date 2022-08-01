import React from "react";
import moment from "moment";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import Select from "react-select";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Button from "@material-ui/core/Button";
import { labelValue } from "../reducers";
import TextField from "@material-ui/core/TextField";
import { map } from "lodash";

const useStyle = makeStyles(theme => ({
  root: {
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: "#F5F7F9"
  },
  filter: {
    marginBottom: theme.spacing(5)
  },
  header: {
    marginBottom: theme.spacing(3)
  },
  textField: {
    backgroundColor: "#FFF"
  }
}));

const getDateAfter = days =>
  moment()
    .startOf("day")
    .add(days, "days");

const dateFilterFieldOptions = [
  labelValue("Today", getDateAfter(0)),
  labelValue("Yesterday", getDateAfter(-1)),
  labelValue("This Week", getDateAfter(-7)),
  labelValue("This Month", getDateAfter(-30))
];

export const Filter = ({
  filterCriteria,
  dispatch,
  onFilterApply,
  userOptions,
  taskTypeOptions,
  taskStatusOptions,
  searchFields
}) => {
  const classes = useStyle();
  const allUserOptions = [labelValue("Unassigned", 0), ...userOptions];
  const onFilterChange = (filter, value) =>
    dispatch({ type: "setFilter", payload: { filter, value } });
  const onMetadataFilterChange = (filter, value) =>
    dispatch({ type: "setMetadataFilter", payload: { filter, value } });

  const selectFilter = (label, options, filter, isMulti = false) => (
    <FormControl fullWidth className={classes.filter}>
      <FormLabel component="legend">{label}</FormLabel>
      <Select
        isClearable
        isSearchable
        isMulti={isMulti}
        value={filterCriteria[filter]}
        options={options}
        style={{ width: "auto" }}
        onChange={event => onFilterChange(filter, event)}
      />
    </FormControl>
  );

  const metadataTextFilter = label => (
    <FormControl fullWidth className={classes.filter}>
      <FormLabel component="legend">{label}</FormLabel>
      <TextField
        className={classes.textField}
        variant="outlined"
        value={filterCriteria.metadata[label]}
        onChange={event => onMetadataFilterChange(label, event.target.value)}
      />
    </FormControl>
  );

  return (
    <Paper className={classes.root}>
      <Typography variant={"h6"} className={classes.header}>
        {"Filters"}
      </Typography>
      {map(searchFields, name => metadataTextFilter(name))}
      {selectFilter("Task type", taskTypeOptions, "taskType")}
      {selectFilter("Task status", taskStatusOptions, "taskStatus")}
      {selectFilter("Assigned to", allUserOptions, "assignedTo")}
      {selectFilter("Created", dateFilterFieldOptions, "createdOn")}
      {selectFilter("Completed", dateFilterFieldOptions, "completedOn")}
      <Button variant="contained" color="primary" onClick={onFilterApply}>
        {"Apply"}
      </Button>
    </Paper>
  );
};
