import React from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { useTranslation } from "react-i18next";
import _ from 'lodash';

export default function RadioButtonsGroup({ items, value, label, onChange }) {
  const { t } = useTranslation();

  const handleChange = event => {
    const selectedValue = parseInt(event.target.value);
    let item = items.find(i => i.id === selectedValue);

    if(_.isUndefined(item))
      item = items.find(i => i.id === event.target.value);

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
            label={t(item.name)}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
