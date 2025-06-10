import React from "react";
import Select from "react-select";
import { FormLabel } from "@mui/material";
import { find, get } from "lodash";

export const OptionSelect = ({ label, options, value, onChange }) => {
  return (
    <div style={{ marginTop: "10px" }}>
      <FormLabel style={{ fontSize: "13px" }}>{label}</FormLabel>
      <br />
      <Select
        placeholder={label}
        value={find(options, op => op.value === value) || null}
        options={options}
        onChange={event => onChange(get(event, "value", null))}
        isClearable={true}
      />
    </div>
  );
};
