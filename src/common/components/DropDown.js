import { styled } from "@mui/material/styles";
import { InputLabel, FormHelperText, FormControl, Select } from "@mui/material";
import _ from "lodash";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: 0,
  width: "100%",
  display: "flex",
  flexWrap: "nowrap"
}));

const DropDown = ({ name, value, onChange, options, required = true, disabled = false }) => {
  return (
    <StyledFormControl required={required}>
      <InputLabel shrink={!_.isEmpty(value)} htmlFor={`${name}-required`}>
        {name}
      </InputLabel>
      <Select
        id={`${name}-required`}
        disabled={disabled}
        native
        value={value}
        onChange={event => onChange(event.target.value)}
        name={name}
        inputProps={{ id: `${name}-required` }}
      >
        <option value="" />
        {options.map((option, index) => (
          <option key={index} value={option.name}>
            {option.name}
          </option>
        ))}
      </Select>
      {required && <FormHelperText>Required</FormHelperText>}
    </StyledFormControl>
  );
};

export default DropDown;
