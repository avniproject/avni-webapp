import React from "react";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import _ from "lodash";

export const LocationHierarchy = ({ hierarchy, setHierarchy, configuredHierarchies }) => {
  const handleChange = event => {
    setHierarchy(event.target.value);
  };

  return (
    <FormControl component="fieldset" style={{ marginTop: "20px" }}>
      <FormLabel component="legend">Select Location Hierarchy</FormLabel>
      <RadioGroup
        aria-label="hierarchy"
        name="hierarchy1"
        value={hierarchy || _.get(configuredHierarchies[0], "value")}
        onChange={handleChange}
      >
        {configuredHierarchies.map(hierarchicalValue => (
          <FormControlLabel
            disabled={configuredHierarchies.length <= 1}
            key={hierarchicalValue.value}
            value={hierarchicalValue.value}
            control={<Radio color="primary" />}
            label={hierarchicalValue.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};
