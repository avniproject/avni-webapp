import { styled } from "@mui/material/styles";
import { FormControl, FormLabel, TextField as MuiTextField } from "@mui/material";
import { Filter } from "../util/FilterStyles";

const StyledTextField = styled(MuiTextField)({
  backgroundColor: "#FFF",
  "& .MuiInputBase-input": {
    padding: 10
  }
});

const TextFilter = ({ label, value, filterCriteria, onFilterChange, isNumeric }) => {
  return (
    <Filter>
      <FormControl fullWidth>
        <FormLabel component="legend">{label}</FormLabel>
        <StyledTextField
          variant="outlined"
          value={value}
          onChange={event => onFilterChange(event.target.value)}
          type={isNumeric ? "number" : "text"}
        />
      </FormControl>
    </Filter>
  );
};

export default TextFilter;
