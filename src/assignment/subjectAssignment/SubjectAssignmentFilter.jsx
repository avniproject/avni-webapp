import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Button } from "@mui/material";
import { Filter, Header } from "../util/FilterStyles";
import SelectFilter from "../components/SelectFilter";
import { dateFilterFieldOptions } from "../util/DateFilterOptions";
import TextFilter from "../components/TextFilter";
import AddressLevelsByType from "../../common/components/AddressLevelsByType";
import { labelValue } from "../util/util";
import { get, isNil } from "lodash";
import { getConceptSearchContract } from "../reducers/SubjectAssignmentReducer";

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
  variant: "h6",
  marginBottom: theme.spacing(3)
}));

const StyledSpacer = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(5)
}));

const renderSyncAttributeFilter = (
  concept,
  filterCriteria,
  filterName,
  onFilterChange
) => {
  if (isNil(concept)) return null;
  const isNumeric = concept.dataType === `Numeric`;

  if (concept.dataType !== "Coded") {
    return (
      <Filter>
        <TextFilter
          isNumeric={isNumeric}
          label={concept.name}
          value={
            isNumeric
              ? get(filterCriteria, `${filterName}.minValue`)
              : get(filterCriteria, `${filterName}.value`)
          }
          filterCriteria={filterCriteria}
          onFilterChange={value => {
            const contract = getConceptSearchContract(concept, value);
            return onFilterChange(filterName, contract);
          }}
        />
      </Filter>
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
  const onFilterChange = (filter, value) =>
    dispatch("setFilter", { filter, value });

  return (
    <Fragment>
      <StyledRootPaper elevation={2}>
        <Header>
          <StyledHeaderTypography>Filters</StyledHeaderTypography>
        </Header>
        <Filter>
          <SelectFilter
            isClearable={false}
            label="Subject type"
            options={subjectOptions}
            filter="subjectType"
            filterCriteria={filterCriteria}
            onFilterChange={onFilterChange}
          />
        </Filter>
        {renderSyncAttributeFilter(
          syncAttribute1,
          filterCriteria,
          "syncAttribute1",
          onFilterChange
        )}
        {renderSyncAttributeFilter(
          syncAttribute2,
          filterCriteria,
          "syncAttribute2",
          onFilterChange
        )}
        <Filter>
          <TextFilter
            label="Subject Name"
            value={filterCriteria.name}
            filterCriteria={filterCriteria}
            onFilterChange={value => onFilterChange("name", value)}
          />
        </Filter>
        <Filter>
          <AddressLevelsByType
            label="Address"
            addressLevelsIds={filterCriteria.addressIds}
            setAddressLevelsIds={ids => onFilterChange("addressIds", ids)}
            skipGrid={true}
          />
        </Filter>
        <StyledSpacer />
        <Filter>
          <SelectFilter
            isMulti={true}
            label="Program"
            options={programOptions}
            filter="programs"
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
            label="User group"
            options={userGroupOptions}
            filter="userGroup"
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
      </StyledRootPaper>
      <StyledApplyPaper elevation={2}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onFilterApply}
        >
          Apply
        </Button>
      </StyledApplyPaper>
    </Fragment>
  );
};

export default SubjectAssignmentFilter;
