import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

export default ({ name, value, onChange, options, style }) => (
  <FormControl required style={style}>
    <InputLabel htmlFor={`${name}-required`}>{name}</InputLabel>
    <Select
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
    <FormHelperText>Required</FormHelperText>
  </FormControl>
);
