import Box from "@mui/material/Box";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextField } from "@mui/material";
import React from "react";

export const DateSelector = ({ label, value, onChange }) => {
  return (
    <Box
      sx={{
        m: 2
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          autoOk
          variant="inline"
          format="dd/MM/yyyy"
          id={label}
          value={value}
          onChange={date => onChange(date)}
          renderInput={params => <TextField {...params} label={label} margin="normal" />}
          slotProps={{
            actionBar: { actions: ["clear"] },
            openPickerButton: { "aria-label": "change date" }
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};
