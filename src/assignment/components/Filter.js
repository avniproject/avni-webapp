import React, { Fragment } from "react";
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
    paddingBottom: theme.spacing(40),
    backgroundColor: "#F5F7F9",
    overflow: "auto",
    position: "fixed",
    height: "100vh"
  },
  filter: {
    marginBottom: theme.spacing(5)
  },
  header: {
    marginBottom: theme.spacing(3)
  },
  textField: {
    backgroundColor: "#FFF"
  },
  applyButton: {
    position: "absolute",
    bottom: 0,
    width: "26%",
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: "#F5F7F9"
  }
}));

const getDateAfter = days =>
  moment()
    .startOf("day")
    .add(days, "days");

const dateFilterFieldOptions = [
  labelValue("Any time", "1900-01-01T18:30:00.000Z"),
  labelValue("Yesterday", getDateAfter(-1)),
  labelValue("Last 7 days", getDateAfter(-7)),
  labelValue("Last 30 days", getDateAfter(-30)),
  labelValue("Last 60 days", getDateAfter(-60)),
  labelValue("Last 180 days", getDateAfter(-180))
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
        maxMenuHeight={120}
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
        inputProps={{
          style: {
            padding: 10
          }
        }}
        variant="outlined"
        value={filterCriteria.metadata[label]}
        onChange={event => onMetadataFilterChange(label, event.target.value)}
      />
    </FormControl>
  );

  return (
    <Fragment>
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
      </Paper>
      <Paper className={classes.applyButton}>
        <Button fullWidth variant="contained" color="primary" onClick={onFilterApply}>
          {"Apply"}
        </Button>
      </Paper>
    </Fragment>
  );
};
