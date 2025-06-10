import _ from "lodash";
import React from "react";
import { FormControl, InputLabel, Select } from "@mui/material";

const blankOption = { name: "New Form", value: "__blankForm__" };

const SelectForm = ({ label = "Please select", formList, value, onChange }) => {
  const convertFormListForDisplay = (list = []) =>
    list.map(form => ({
      name: form.formName,
      value: form
    }));

  const showValue = _.isEmpty(value) ? blankOption.value : value;

  let options = _.concat([], blankOption, convertFormListForDisplay(formList));

  return (
    <FormControl style={{ minWidth: 200 }}>
      <InputLabel id={label}>{label}</InputLabel>
      <Select
        labelid={label}
        value={showValue}
        autoWidth
        native
        onChange={event => onChange(_.find(formList, form => form.formName === event.target.value))}
      >
        {options.map((option, index) => (
          <option key={index} value={option.name}>
            {option.name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectForm;
