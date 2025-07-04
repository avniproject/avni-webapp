import { Radio, RadioGroup, FormControlLabel, FormControl } from "@mui/material";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";

export default function RadioButtonsGroup({ items, value, label, onChange, toolTipKey, disabled = false }) {
  const { t } = useTranslation();

  const handleChange = event => {
    const selectedValue = parseInt(event.target.value);
    let item = items.find(i => i.id === selectedValue);

    if (_.isUndefined(item)) item = items.find(i => i.id === event.target.value);

    onChange(item);
  };

  return (
    <FormControl component="fieldset">
      <AvniFormLabel label={label} toolTipKey={toolTipKey} />
      <RadioGroup row aria-label="addressTypes" name="addressTypes" value={value} onChange={handleChange}>
        {items.map((item, index) => (
          <FormControlLabel disabled={disabled} key={index} value={item.id} control={<Radio color="primary" />} label={t(item.name)} />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
