import React, { Fragment } from "react";
import { Typography, Button, Box } from "@mui/material";
import { Root, Header, ApplyButton } from "../util/FilterStyles";
import SelectFilter from "../components/SelectFilter";
import { dateFilterFieldOptions } from "../util/DateFilterOptions";
import TextFilter from "../components/TextFilter";
import AddressLevelsByType from "../../common/components/AddressLevelsByType";
import { labelValue } from "../util/util";
import { get, isNil } from "lodash";
import { getConceptSearchContract } from "../reducers/SubjectAssignmentReducer";

const renderSyncAttributeFilter = (concept, filterCriteria, filterName, onFilterChange) => {
  if (isNil(concept)) return null;
  const isNumeric = concept.dataType === `Numeric`;

  if (concept.dataType !== "Coded") {
    return (
      <TextFilter
        isNumeric={isNumeric}
        label={concept.name}
        value={isNumeric ? get(filterCriteria, `${filterName}.minValue`) : get(filterCriteria, `${filterName}.value`)}
        filterCriteria={filterCriteria}
        onFilterChange={value => {
          const contract = getConceptSearchContract(concept, value);
          return onFilterChange(filterName, contract);
        }}
      />
    );
  } else return null;
};

const SubjectAssignmentFilter = ({
                                   onFilterApply,
                                   subjectOptions,
                                   programOptions,
                                   userOptions,
                                   userGroupOptions,
                                   syncAttribute1,
                                   syncAttribute2,
                                   dispatch,
                                   filterCriteria
                                 }) => {
  const onFilterChange = (filter, value) => dispatch("setFilter", { filter, value });
  return (
    <Fragment>
      <Root>
        <Header>
          <Typography variant={"h6"}>{"Filters"}</Typography>
        </Header>
        <SelectFilter
          isClearable={false}
          label={"Subject type"}
          options={subjectOptions}
          filter={"subjectType"}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
        />
        {renderSyncAttributeFilter(syncAttribute1, filterCriteria, "syncAttribute1", onFilterChange)}
        {renderSyncAttributeFilter(syncAttribute2, filterCriteria, "syncAttribute2", onFilterChange)}
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
        <Box
          sx={{
            mb: 5
          }}
        />
        <SelectFilter
          isMulti={true}
          label={"Program"}
          options={programOptions}
          filter={"programs"}
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
      </Root>
      <ApplyButton>
        <Button fullWidth variant="contained" color="primary" onClick={onFilterApply}>
          {"Apply"}
        </Button>
      </ApplyButton>
    </Fragment>
  );
};
export default SubjectAssignmentFilter;