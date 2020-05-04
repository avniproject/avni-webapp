import React from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

export default function RadioButtonsGroup({ items, value, label, onChange }) {
  const handleChange = event => {
    const selectedValue = parseInt(event.target.value);
    const item = items.find(i => i.id === selectedValue);
    onChange(item);
  };

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup
        row
        aria-label="addressTypes"
        name="addressTypes"
        value={value}
        onChange={handleChange}
      >
        {items.map((item, index) => (
          <FormControlLabel
            key={index}
            value={item.id}
            control={<Radio color="primary" />}
            label={item.name}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
