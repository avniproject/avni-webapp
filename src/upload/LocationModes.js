import React from "react";
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Tooltip } from "@mui/material";

export const LocationModes = ({ mode, setMode }) => {
  const handleChange = event => {
    setMode(event.target.value);
  };

  return (
    <FormControl component="fieldset" style={{ marginTop: "20px" }}>
      <FormLabel component="legend">Select Mode</FormLabel>
      <RadioGroup row aria-label="mode" name="mode1" value={mode || "CREATE"} onChange={handleChange}>
        <Tooltip title="Create new locations" placement="bottom-start" arrow>
          <div>
            <FormControlLabel value="CREATE" control={<Radio color="primary" />} label="Create" />
          </div>
        </Tooltip>
        <Tooltip title="Edit locations' name, parent, GPS coordinates or properties" placement="bottom-start" arrow>
          <div>
            <FormControlLabel value="EDIT" control={<Radio color="primary" />} label="Edit" />
          </div>
        </Tooltip>
      </RadioGroup>
    </FormControl>
  );
};
