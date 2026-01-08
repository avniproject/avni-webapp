import { Fragment } from "react";
import { TextField, Select, InputLabel } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

export const ValueTextUnitSelect = ({
  label,
  value,
  unit,
  units,
  textProps,
  selectProps,
  errorMsg,
  onValueChange,
  onUnitChange,
}) => {
  return (
    <Fragment>
      <p />
      <div style={{ display: "flex", alignItems: "baseline" }}>
        {label && <InputLabel>{label}</InputLabel>}
        <TextField
          autoComplete="off"
          value={value}
          sx={{
            marginLeft: "20px",
            width: "70px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "transparent",
              "& fieldset": {
                border: "1px solid rgba(0, 0, 0, 0.23)", // Optional: maintain border if needed
              },
            },
          }}
          onChange={(event) => onValueChange(event)}
          variant="outlined"
          {...textProps}
        />
        <Select
          value={unit}
          onChange={(event) => onUnitChange(event)}
          sx={{
            marginLeft: "20px",
            width: "120px", // Increased from 100px to 120px
            "& .MuiSelect-select": {
              padding: "8.5px 14px", // Match TextField padding
              height: "1.4375em", // Match TextField height
            },
          }}
          {...selectProps}
        >
          {units.map((unitOption) => (
            <MenuItem key={unitOption.value} value={unitOption.value}>
              {unitOption.label}
            </MenuItem>
          ))}
        </Select>
      </div>
      {errorMsg && errorMsg}
    </Fragment>
  );
};
