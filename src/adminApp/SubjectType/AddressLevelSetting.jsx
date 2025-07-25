import { FormControl } from "@mui/material";
import Select from "react-select";
import { filter, includes, map } from "lodash";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";

export const AddressLevelSetting = ({
  levelUUIDs,
  setLevelUUIDs,
  locationTypes
}) => {
  const selectedTypes = filter(locationTypes, ({ uuid }) =>
    includes(levelUUIDs, uuid)
  );
  const createListOptions = list =>
    map(list, ({ name, uuid }) => ({ label: name, value: uuid }));

  const onChange = event => {
    const selectedLevelUUIDs = map(event, ({ value }) => value);
    setLevelUUIDs(selectedLevelUUIDs);
  };

  return (
    <FormControl fullWidth component="fieldset">
      <AvniFormLabel
        component="legend"
        toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_ADVANCED_ADDRESS"}
        label={"Location type where this subject can be registered"}
      />
      <Select
        isMulti
        isSearchable
        placeholder={`Select location type`}
        value={createListOptions(selectedTypes)}
        options={createListOptions(locationTypes)}
        onChange={onChange}
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null
        }}
      />
    </FormControl>
  );
};
