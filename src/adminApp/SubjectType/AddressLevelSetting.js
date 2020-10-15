import React from "react";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Select from "react-select";
import { Grid } from "@material-ui/core";
import { filter, includes, map } from "lodash";

export const AddressLevelSetting = ({ levelUUIDs, setLevelUUIDs, locationTypes }) => {
  const selectedTypes = filter(locationTypes, ({ uuid }) => includes(levelUUIDs, uuid));
  const createListOptions = list => map(list, ({ name, uuid }) => ({ label: name, value: uuid }));

  const onChange = event => {
    const selectedLevelUUIDs = map(event, ({ value }) => value);
    setLevelUUIDs(selectedLevelUUIDs);
  };

  return (
    <FormControl fullWidth component="fieldset">
      <FormLabel component="legend">
        {"Location type where this subject can be registered"}
      </FormLabel>
      <Select
        isMulti
        isSearchable
        placeholder={`Select location type`}
        value={createListOptions(selectedTypes)}
        options={createListOptions(locationTypes)}
        onChange={onChange}
        components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
      />
    </FormControl>
  );
};
