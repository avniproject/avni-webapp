import React from "react";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";

export const LocationModes = ({ mode, setMode }) => {
  const handleChange = event => {
    setMode(event.target.value);
  };

  return (
    <FormControl component="fieldset" style={{ marginTop: "20px" }}>
      <FormLabel component="legend">Select Mode</FormLabel>
      <RadioGroup
        row
        aria-label="mode"
        name="mode1"
        value={mode || "relaxed"}
        onChange={handleChange}
      >
        <FormControlLabel value="relaxed" control={<Radio color="primary" />} label="Create" />
        <FormControlLabel
          value="strict"
          control={<Radio color="primary" />}
          label="Edit + Create"
        />
      </RadioGroup>
    </FormControl>
  );
};
