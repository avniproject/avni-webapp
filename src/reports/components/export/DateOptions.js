import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import Grid from "@material-ui/core/Grid";
import { DateSelector } from "./DateSelector";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

export const DateOptions = ({ startDate, endDate, dispatch, startDateLabel, endDateLabel }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container direction="row" justify="flex-start">
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
    </MuiPickersUtilsProvider>
  );
};
