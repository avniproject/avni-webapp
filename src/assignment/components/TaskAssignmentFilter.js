import React, { Fragment } from "react";
import { Paper, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { map } from "lodash";
import SelectFilter from "./SelectFilter";
import { dateFilterFieldOptions } from "../util/DateFilterOptions";
import { useStyle } from "../util/FilterStyles";
import { labelValue } from "../util/util";
import TextFilter from "./TextFilter";
import _ from "lodash";

export const TaskAssignmentFilter = ({
  filterCriteria,
  dispatch,
  onFilterApply,
  userOptions,
  taskTypeOptions,
  taskStatusOptions,
  conceptNameAnswerPairs
}) => {
  const classes = useStyle();
  const allUserOptions = [labelValue("Unassigned", 0), ...userOptions];
  const onFilterChange = (filter, value) =>
    dispatch({ type: "setFilter", payload: { filter, value } });
  const onMetadataFilterChange = (filter, value) =>
    dispatch({ type: "setMetadataFilter", payload: { filter, value } });

  return (
    <Fragment>
      <Paper className={classes.root}>
        <Typography variant={"h6"} className={classes.header}>
          {"Filters"}
        </Typography>
        {map(conceptNameAnswerPairs, conceptNameAnswerPair => {
          const [name, answers] = conceptNameAnswerPair;
          return _.isNil(answers) ? (
            <TextFilter
              label={name}
              value={filterCriteria.metadata[name]}
              filterCriteria={filterCriteria}
              onFilterChange={value => onMetadataFilterChange(name, value)}
            />
          ) : (
            <SelectFilter
              label={name}
              options={answers.map(x => labelValue(x))}
              filter={filterCriteria.metadata[name]}
              filterCriteria={filterCriteria}
              onFilterChange={(filter, event) => onMetadataFilterChange(name, event && event.value)}
            />
          );
        })}
        <SelectFilter
          label={"Task type"}
          options={taskTypeOptions}
          filter={"taskType"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
        <SelectFilter
          label={"Task status"}
          options={taskStatusOptions}
          filter={"taskStatus"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
        <SelectFilter
          label={"Assigned to"}
          options={allUserOptions}
          filter={"assignedTo"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
        <SelectFilter
          label={"Created"}
          options={dateFilterFieldOptions}
          filter={"createdOn"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
        <SelectFilter
          label={"Scheduled"}
          options={dateFilterFieldOptions}
          filter={"scheduledOn"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
        <SelectFilter
          label={"Completed"}
          options={dateFilterFieldOptions}
          filter={"completedOn"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
      </Paper>
      <Paper className={classes.applyButton}>
        <Button fullWidth variant="contained" color="primary" onClick={onFilterApply}>
          {"Apply"}
        </Button>
      </Paper>
    </Fragment>
  );
};
