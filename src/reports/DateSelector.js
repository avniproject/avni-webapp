import Box from "@material-ui/core/Box";
import { KeyboardDatePicker } from "@material-ui/pickers";
import React from "react";

export const DateSelector = ({ label, value, onChange }) => {
  return (
    <Box m={2}>
      <KeyboardDatePicker
        disableToolbar
        variant="inline"
        format="dd/MM/yyyy"
        margin="normal"
        id={label}
        label={label}
        value={value}
        onChange={date => onChange(date)}
        KeyboardButtonProps={{
          "aria-label": "change date"
        }}
      />
    </Box>
  );
};
