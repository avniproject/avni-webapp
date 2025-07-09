import _ from "lodash";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const blankOption = { name: "New Form", value: "__blankForm__" };

const SelectForm = ({ label = "Please select", formList, value, onChange }) => {
  const convertFormListForDisplay = (list = []) =>
    list.map(form => ({
      name: form.formName,
      value: form
    }));

  const showValue = _.isEmpty(value) ? blankOption.value : value;

  const options = _.concat([], blankOption, convertFormListForDisplay(formList));

  return (
    <FormControl style={{ minWidth: 200 }}>
      <InputLabel id={label}>{label}</InputLabel>
      <Select
        labelId={label}
        value={showValue}
        label={label}
        onChange={event => {
          const selectedOption = _.find(options, opt => opt.name === event.target.value);
          onChange(selectedOption ? selectedOption.value : null);
        }}
      >
        {options.map((option, index) => (
          <MenuItem key={index} value={option.name}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectForm;
