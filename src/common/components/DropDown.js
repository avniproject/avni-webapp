import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import _ from "lodash";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: 0,
    fullWidth: true,
    display: "flex",
    wrap: "nowrap"
  }
}));

const DropDown = ({
  name,
  value,
  onChange,
  options,
  style,
  shrink = !_.isEmpty(value),
  required = true,
  disabled = false
}) => {
  const classes = useStyles();

  return (
    <FormControl required={required} style={style}>
      <InputLabel shrink={shrink} htmlFor={`${name}-required`}>
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
    </FormControl>
  );
};

export default DropDown;
