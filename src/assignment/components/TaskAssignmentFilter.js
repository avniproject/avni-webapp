import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Button } from "@mui/material";
import _, { map } from "lodash";
import SelectFilter from "./SelectFilter";
import { dateFilterFieldOptions } from "../util/DateFilterOptions";
import { Filter, Header } from "../util/FilterStyles";
import { labelValue } from "../util/util";
import TextFilter from "./TextFilter";

const StyledRootPaper = styled(Paper)(({ theme }) => ({
  paddingRight: theme.spacing(5),
  paddingLeft: theme.spacing(5),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(40),
  backgroundColor: "#F5F7F9",
  overflow: "auto",
  position: "fixed",
  height: "100vh"
}));

const StyledApplyPaper = styled(Paper)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  width: "26%",
  paddingRight: theme.spacing(5),
  paddingLeft: theme.spacing(5),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  backgroundColor: "#F5F7F9"
}));

const StyledHeaderTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

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
      <StyledRootPaper elevation={2}>
        <Header>
          <StyledHeaderTypography variant="h6">Filters</StyledHeaderTypography>
        </Header>
        {map(conceptNameAnswerPairs, conceptNameAnswerPair => {
          const [name, answers] = conceptNameAnswerPair;
          return _.isNil(answers) ? (
            <Filter key={name}>
              <TextFilter
                label={name}
                value={filterCriteria.metadata[name]}
                filterCriteria={filterCriteria}
                onFilterChange={value => onMetadataFilterChange(name, value)}
              />
            </Filter>
          ) : (
            <Filter key={name}>
              <SelectFilter
                label={name}
                options={answers.map(x => labelValue(x))}
                filter={filterCriteria.metadata[name]}
                filterCriteria={filterCriteria}
                onFilterChange={(filter, event) => onMetadataFilterChange(name, event && event.value)}
              />
            </Filter>
          );
        })}
        <Filter>
          <SelectFilter
            label="Task type"
            options={taskTypeOptions}
            filter="taskType"
            filterCriteria={filterCriteria}
            onFilterChange={onFilterChange}
          />
        </Filter>
        <Filter>
          <SelectFilter
            label="Task status"
            options={taskStatusOptions}
            filter="taskStatus"
            filterCriteria={filterCriteria}
            onFilterChange={onFilterChange}
          />
        </Filter>
        <Filter>
          <SelectFilter
            label="Assigned to"
            options={[labelValue("Unassigned", 0), ...userOptions]}
            filter="assignedTo"
            filterCriteria={filterCriteria}
            onFilterChange={onFilterChange}
          />
        </Filter>
        <Filter>
          <SelectFilter
            label="Created"
            options={dateFilterFieldOptions}
            filter="createdOn"
            filterCriteria={filterCriteria}
            onFilterChange={onFilterChange}
          />
        </Filter>
        <Filter>
          <SelectFilter
            label="Scheduled"
            options={dateFilterFieldOptions}
            filter="scheduledOn"
            filterCriteria={filterCriteria}
            onFilterChange={onFilterChange}
          />
        </Filter>
        <Filter>
          <SelectFilter
            label="Completed"
            options={dateFilterFieldOptions}
            filter="completedOn"
            filterCriteria={filterCriteria}
            onFilterChange={onFilterChange}
          />
        </Filter>
      </StyledRootPaper>
      <StyledApplyPaper elevation={2}>
        <Button fullWidth variant="contained" color="primary" onClick={onFilterApply}>
          Apply
        </Button>
      </StyledApplyPaper>
    </Fragment>
  );
};
