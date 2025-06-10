import { FormLabel, FormControl } from "@mui/material";
import Select from "react-select";
import React from "react";

const SingleSelectSearch = ({ title, placeholder, value, options, onChange }) => {
  return (
    <FormControl fullWidth component="fieldset">
      <FormLabel component="legend">{title}</FormLabel>
      <Select isSearchable placeholder={placeholder} value={value} options={options} onChange={event => onChange(event)} />
    </FormControl>
  );
};

export default SingleSelectSearch;
