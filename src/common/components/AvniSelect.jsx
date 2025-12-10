import { Autocomplete, TextField } from "@mui/material";
import { useCallback } from "react";
import { ToolTipContainer } from "./ToolTipContainer";

export const AvniSelect = ({
  options,
  toolTipKey,
  isClearable,
  onChange,
  onOpen,
  onClose,
  value,
  label,
  required,
  style,
  ...otherProps
}) => {
  const handleChange = useCallback(
    (event, newValue) => {
      // Handle multiple selection case
      let actualValue;
      if (otherProps.multiple) {
        // For multiple selection, newValue is an array of option objects
        actualValue = Array.isArray(newValue)
          ? newValue
              .map((option) => option?.value)
              .filter((v) => v !== undefined)
          : [];
      } else {
        // For single selection, extract value from the selected option object
        actualValue = newValue?.value || null;
      }

      // Create synthetic event similar to Select onChange
      const syntheticEvent = {
        target: { value: actualValue },
        type: "change",
        currentTarget: { value: actualValue },
      };

      if (onChange) {
        onChange(syntheticEvent);
      }
    },
    [onChange, otherProps.multiple],
  );

  // Find the selected option object based on the current value
  const selectedOption = otherProps.multiple
    ? Array.isArray(value)
      ? options?.filter((option) => value.includes(option.value)) || []
      : []
    : options?.find((option) => option.value === value) || null;

  const finalOptions = options || [];

  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <Autocomplete
        sx={{
          minWidth: 200,
          "& .MuiInputBase-root": { backgroundColor: "white" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
          ...style,
        }}
        options={finalOptions}
        value={selectedOption}
        onChange={handleChange}
        onOpen={onOpen}
        onClose={onClose}
        getOptionLabel={(option) => option?.label || ""}
        isOptionEqualToValue={(option, value) => option?.value === value?.value}
        clearOnBlur
        disableClearable={!isClearable}
        renderInput={(params) => (
          <TextField {...params} label={label} required={required} />
        )}
        {...otherProps}
      />
    </ToolTipContainer>
  );
};
