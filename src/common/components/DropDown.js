import { styled } from "@mui/material/styles";
import { InputLabel, FormHelperText, FormControl, Select } from "@mui/material";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  width: "auto",
  minWidth: 120,
  maxWidth: 200,
  display: "flex",
  flexWrap: "nowrap"
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  maxWidth: "100%",
  textOverflow: "ellipsis",
  paddingRight: theme.spacing(2)
}));

const DropDown = ({ name, value, onChange, options, required = true, disabled = false }) => {
  return (
    <StyledFormControl required={required}>
      <StyledInputLabel htmlFor={`${name}-required`}>{name}</StyledInputLabel>
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
