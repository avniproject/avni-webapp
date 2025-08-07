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
      // Extract just the value from the selected option object
      const actualValue = newValue?.value || null;

      // Create synthetic event similar to Select onChange
      // Don't spread the original event as its target.value might be different
      const syntheticEvent = {
        target: { value: actualValue },
        type: "change",
        currentTarget: { value: actualValue }
      };

      if (onChange) {
        onChange(syntheticEvent);
      }
    },
    [onChange]
  );

  // Find the selected option object based on the current value
  const selectedOption =
    options?.find(option => option.value === value) || null;

  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <Autocomplete
        sx={{
          minWidth: 200,
          "& .MuiInputBase-root": { backgroundColor: "white" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
          ...style
        }}
        options={options || []}
        value={selectedOption}
        onChange={handleChange}
        onOpen={onOpen}
        onClose={onClose}
        getOptionLabel={option => option?.label || ""}
        isOptionEqualToValue={(option, value) => option?.value === value?.value}
        clearOnBlur
        disableClearable={!isClearable}
        renderInput={params => (
          <TextField {...params} label={label} required={required} />
        )}
        {...otherProps}
      />
    </ToolTipContainer>
  );
};
