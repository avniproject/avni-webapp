import React from "react";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";

export const ValueTextUnitSelect = ({ label, value, unit, units, textProps, selectProps, errorMsg, onValueChange, onUnitChange }) => {
  return (
    <React.Fragment>
      <p />
      <div style={{ display: "flex", alignItems: "baseline" }}>
        {label && <InputLabel>{label}</InputLabel>}
        <TextField
          autoComplete="off"
          value={value}
          style={{ marginLeft: "20px", width: "50px" }}
          onChange={event => onValueChange(event)}
          {...textProps}
        />
        <Select value={unit} onChange={event => onUnitChange(event)} style={{ marginLeft: "20px", width: "100px" }} {...selectProps}>
          {units}
        </Select>
      </div>
      {errorMsg && errorMsg}
    </React.Fragment>
  );
};
