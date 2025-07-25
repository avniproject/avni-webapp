import { Grid } from "@mui/material";
import { DateSelector } from "./DateSelector";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export const DateOptions = ({
  startDate,
  endDate,
  dispatch,
  startDateLabel,
  endDateLabel
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid
        container
        direction="row"
        sx={{
          justifyContent: "flex-start"
        }}
      >
        <DateSelector
          label={startDateLabel}
          value={startDate}
          onChange={date => dispatch("startDate", date)}
        />
        <DateSelector
          label={endDateLabel}
          value={endDate}
          onChange={date => dispatch("endDate", date)}
        />
      </Grid>
    </LocalizationProvider>
  );
};
