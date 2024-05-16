import React from "react";
import { deburr, isEmpty } from "lodash";
import AsyncSelect from "react-select/async";

const CommonSearch = ({ value, onChange, isMulti, placeholder, defaultOptions = [], loadOptionsByValue }) => {
  const loadOptions = (value, callback) => {
    if (!value) {
      callback(defaultOptions);
    }
    const inputValue = deburr(value.trim()).toLowerCase();
    loadOptionsByValue(encodeURIComponent(inputValue), callback);
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={defaultOptions}
      isMulti={isMulti}
      value={isEmpty(value) ? null : value}
      placeholder={placeholder}
      onChange={onChange}
      loadOptions={loadOptions}
    />
  );
};

export default CommonSearch;
