import FormLabel from "@material-ui/core/FormLabel";
import Select from "react-select";
import FormControl from "@material-ui/core/FormControl";
import React from "react";

const SingleSelectSearch = ({ title, placeholder, value, options, onChange }) => {
  return (
    <FormControl fullWidth component="fieldset">
      <FormLabel component="legend">{title}</FormLabel>
      <Select
        isSearchable
        placeholder={placeholder}
        value={value}
        options={options}
        onChange={event => onChange(event)}
      />
    </FormControl>
  );
};

export default SingleSelectSearch;
