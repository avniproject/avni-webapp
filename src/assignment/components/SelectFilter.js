import { styled } from "@mui/material/styles";
import { FormControl, FormLabel } from "@mui/material";
import Select from "react-select";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(5)
}));

const StyledSelect = styled(Select)({
  width: "auto"
});

const SelectFilter = ({ label, options, filter, isMulti = false, filterCriteria, onFilterChange, isClearable = true }) => {
  return (
    <StyledFormControl fullWidth>
      <FormLabel component="legend">{label}</FormLabel>
      <StyledSelect
        isClearable={isClearable}
        maxMenuHeight={120}
        isMulti={isMulti}
        value={filterCriteria[filter]}
        options={options}
        onChange={event => onFilterChange(filter, event)}
      />
    </StyledFormControl>
  );
};

export default SelectFilter;
