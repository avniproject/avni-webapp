import React from "react";
import { makeStyles } from "@mui/styles";
import { InputLabel, FormHelperText, FormControl, Select } from "@mui/material";
import _ from "lodash";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: 0,
    fullWidth: true,
    display: "flex",
    wrap: "nowrap"
  }
}));

const DropDown = ({ name, value, onChange, options, style, required = true, disabled = false }) => {
  const classes = useStyles();

  return (
    <FormControl required={required} style={style} className={classes.formControl}>
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
    </FormControl>
  );
};

export default DropDown;
