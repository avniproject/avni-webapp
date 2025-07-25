import { memo, useState, useEffect } from "react";
import {
  Autocomplete,
  Checkbox,
  TextField,
  MenuItem,
  Box
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { updateUserAssignmentToSubject } from "./SubjectAssignmentData";
import _, { debounce, isEqual } from "lodash";

const SubjectAssignmentMultiSelect = props => {
  const [selectedOptions, setSelectedOptions] = useState(
    getSortedDropdownList(props.selectedOptions)
  );

  useEffect(() => {
    setSelectedOptions(getSortedDropdownList(props.selectedOptions));
  }, [props.selectedOptions]);

  function getSortedDropdownList(unsortedList) {
    return _.sortBy(unsortedList, [o => _.upperCase(o.label)]);
  }

  const _onChange = (event, value) => {
    updateUserAssignmentToSubject(event).then(([error]) => {
      if (error) {
        alert(error);
      } else {
        setSelectedOptions(value);
      }
    });
  };

  const debouncedOnChange = debounce(_onChange, 500, {
    leading: true,
    trailing: false
  });

  function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
    if (value.length === 0) {
      return placeholderButtonLabel;
    }
    let labelDenotingAssignedUsers = `${value.length} user(s): ${value
      .map(entry => entry.label)
      .join(", ")}`;
    let truncatedLabel = _.truncate(labelDenotingAssignedUsers, { length: 50 });
    return truncatedLabel;
  }

  return (
    <Autocomplete
      multiple
      options={getSortedDropdownList(props.options)}
      value={selectedOptions}
      onChange={debouncedOnChange}
      getOptionLabel={option => option.label}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      disableCloseOnSelect
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={getDropdownButtonLabel({
            placeholderButtonLabel: "Select users",
            value: selectedOptions
          })}
        />
      )}
      renderOption={(props, option, { selected }) => (
        <MenuItem
          {...props}
          key={option.id}
          value={option}
          sx={{ justifyContent: "space-between" }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Checkbox checked={selected} icon={<CheckIcon />} />
            {option.label}
          </Box>
        </MenuItem>
      )}
      ListboxProps={{
        style: {
          backgroundColor: "white",
          opacity: 1,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          borderRadius: "4px",
          maxHeight: "300px",
          overflowY: "auto",
          width: "auto",
          zIndex: 2000
        }
      }}
      PopperProps={{
        style: { zIndex: 2000 },
        popperOptions: {
          modifiers: [
            {
              name: "flip",
              enabled: true
            },
            {
              name: "preventOverflow",
              enabled: true,
              options: {
                boundary: "clippingParents"
              }
            }
          ]
        },
        container: document.body
      }}
      sx={{ minWidth: "200px", minHeight: "40px" }}
    />
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default memo(SubjectAssignmentMultiSelect, areEqual);
