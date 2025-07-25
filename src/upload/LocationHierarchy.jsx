import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from "@mui/material";

export const LocationHierarchy = ({
  hierarchy,
  setHierarchy,
  configuredHierarchies
}) => {
  const handleChange = event => {
    setHierarchy(event.target.value);
  };

  return (
    <FormControl component="fieldset" style={{ marginTop: "20px" }}>
      <FormLabel component="legend">Select Location Hierarchy</FormLabel>
      <RadioGroup
        aria-label="hierarchy"
        name="hierarchy1"
        value={hierarchy}
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
