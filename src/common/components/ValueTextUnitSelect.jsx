import { Fragment } from "react";
import { TextField, Select, InputLabel } from "@mui/material";

export const ValueTextUnitSelect = ({
  label,
  value,
  unit,
  units,
  textProps,
  selectProps,
  errorMsg,
  onValueChange,
  onUnitChange
}) => {
  return (
    <Fragment>
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
        <Select
          value={unit}
          onChange={event => onUnitChange(event)}
          style={{ marginLeft: "20px", width: "100px" }}
          {...selectProps}
        >
          {units}
        </Select>
      </div>
      {errorMsg && errorMsg}
    </Fragment>
  );
};
