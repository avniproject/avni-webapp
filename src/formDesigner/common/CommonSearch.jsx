import { deburr, isEmpty } from "lodash";
import AsyncSelect from "react-select/async";

const selectStyles = {
  container: (base) => ({
    ...base,
    width: "100%",
    minWidth: 0,
  }),
  control: (base) => ({
    ...base,
    minWidth: 0,
    maxWidth: "100%",
  }),
  valueContainer: (base) => ({
    ...base,
    flexWrap: "wrap",
    maxWidth: "100%",
    overflowX: "hidden",
  }),
  multiValue: (base) => ({
    ...base,
    maxWidth: "100%",
  }),
  multiValueLabel: (base) => ({
    ...base,
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
};

const CommonSearch = ({
  value,
  onChange,
  isMulti,
  placeholder,
  defaultOptions = [],
  loadOptionsByValue,
}) => {
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
      styles={selectStyles}
      value={isEmpty(value) ? null : value}
      placeholder={placeholder}
      onChange={onChange}
      loadOptions={loadOptions}
    />
  );
};

export default CommonSearch;
