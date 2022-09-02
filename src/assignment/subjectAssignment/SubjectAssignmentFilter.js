import React, { Fragment } from "react";
import { Paper, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { useStyle } from "../util/FilterStyles";
import SelectFilter from "../components/SelectFilter";
import { dateFilterFieldOptions } from "../util/DateFilterOptions";
import TextFilter from "../components/TextFilter";
import AddressLevelsByType from "../../common/components/AddressLevelsByType";
import Box from "@material-ui/core/Box";

const SubjectAssignmentFilter = ({
  onFilterApply,
  subjectOptions,
  programOptions,
  userOptions,
  userGroupOptions,
  dispatch,
  filterCriteria
}) => {
  const classes = useStyle();
  console.log("filterCriteria,", filterCriteria);
  const onFilterChange = (filter, value) => dispatch("setFilter", { filter, value });
  return (
    <Fragment>
      <Paper className={classes.root}>
        <Typography variant={"h6"} className={classes.header}>
          {"Filters"}
        </Typography>
        <SelectFilter
          label={"Subject type"}
          options={subjectOptions}
          filter={"subjectType"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
        <TextFilter
          label={"Subject Name"}
          value={filterCriteria.name}
          filterCriteria={filterCriteria}
          onFilterChange={value => onFilterChange("name", value)}
        />
        <AddressLevelsByType
          label={"Address"}
          addressLevelsIds={filterCriteria.addressIds}
          setAddressLevelsIds={ids => onFilterChange("addressIds", ids)}
          skipGrid={true}
        />
        <Box mb={5} />
        <SelectFilter
          label={"Program"}
          options={programOptions}
          filter={"program"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
        <SelectFilter
          label={"User"}
          options={userOptions}
          filter={"user"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
        <SelectFilter
          label={"User group"}
          options={userGroupOptions}
          filter={"userGroup"}
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
      </Paper>
      <Paper className={classes.applyButton}>
        <Button fullWidth variant="contained" color="primary" onClick={onFilterApply}>
          {"Apply"}
        </Button>
      </Paper>
    </Fragment>
  );
};

export default SubjectAssignmentFilter;
