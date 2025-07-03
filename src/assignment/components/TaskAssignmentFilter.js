import React, { Fragment } from "react";
import { Typography, Button } from "@mui/material";
import _, { map } from "lodash";
import SelectFilter from "./SelectFilter";
import { dateFilterFieldOptions } from "../util/DateFilterOptions";
import { Root, Header, ApplyButton } from "../util/FilterStyles";
import { labelValue } from "../util/util";
import TextFilter from "./TextFilter";

export const TaskAssignmentFilter = ({
                                       filterCriteria,
                                       dispatch,
                                       onFilterApply,
                                       userOptions,
                                       taskTypeOptions,
                                       taskStatusOptions,
                                       conceptNameAnswerPairs
                                     }) => {
  const onFilterChange = (filter, value) => dispatch({ type: "setFilter", payload: { filter, value } });
  const onMetadataFilterChange = (filter, value) => dispatch({ type: "setMetadataFilter", payload: { filter, value } });

  return (
    <Fragment>
      <Root>
        <Header>
          <Typography variant={"h6"}>{"Filters"}</Typography>
        </Header>
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
          options={[labelValue("Unassigned", 0), ...userOptions]}
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
      </Root>
      <ApplyButton>
        <Button fullWidth variant="contained" color="primary" onClick={onFilterApply}>
          {"Apply"}
        </Button>
      </ApplyButton>
    </Fragment>
  );
};