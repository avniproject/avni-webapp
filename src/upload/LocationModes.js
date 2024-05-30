import React from "react";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Tooltip from "@material-ui/core/Tooltip";

export const LocationModes = ({ mode, setMode }) => {
  const handleChange = event => {
    setMode(event.target.value);
  };

  return (
    <FormControl component="fieldset" style={{ marginTop: "20px" }}>
      <FormLabel component="legend">Select Mode</FormLabel>
      <RadioGroup row aria-label="mode" name="mode1" value={mode || "relaxed"} onChange={handleChange}>
        <Tooltip title="Create new locations" placement="bottom-start" arrow>
          <div>
            <FormControlLabel value="relaxed" control={<Radio color="primary" />} label="Create" />
          </div>
        </Tooltip>
        <Tooltip title="Edit locations' name, parent, GPS co-ordinates or properties" placement="bottom-start" arrow>
          <div>
            <FormControlLabel value="strict" control={<Radio color="primary" />} label="Edit" />
          </div>
        </Tooltip>
      </RadioGroup>
    </FormControl>
  );
};
