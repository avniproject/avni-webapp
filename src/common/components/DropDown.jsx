import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import { InputLabel, FormHelperText, FormControl } from "@mui/material";
import { AvniSelect } from "./AvniSelect";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  width: "auto",
  minWidth: 120,
  maxWidth: 200,
  display: "flex",
  flexWrap: "nowrap"
}));

const DropDown = ({
  name,
  value,
  onChange,
  options,
  required = true,
  disabled = false
}) => {
  return (
    <StyledFormControl required={required}>
      <AvniSelect
        id={`${name}-required`}
        label={name}
        disabled={disabled}
        value={value}
        onChange={event => onChange(event.target.value)}
        name={name}
        inputProps={{ id: `${name}-required` }}
        options={options.map((option, index) => (
          <MenuItem key={index} value={option.name}>
            {option.name}
          </MenuItem>
        ))}
      />
      {required && <FormHelperText>Required</FormHelperText>}
    </StyledFormControl>
  );
};

export default DropDown;
