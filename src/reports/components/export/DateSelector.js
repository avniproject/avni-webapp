import Box from "@mui/material/Box";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

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
          slotProps={{
            textField: {
              label,
              margin: "normal",
              variant: "outlined"
            },
            actionBar: { actions: ["clear"] },
            openPickerButton: { "aria-label": "change date" }
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};
