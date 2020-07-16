import React, { Fragment } from "react";
import { TextField, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
  KeyboardTimePicker,
  KeyboardDatePicker
} from "@material-ui/pickers";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  lableStyle: {
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.54)"
  }
}));

function NonConceptForm({ searchFilterForms, onChange }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = React.useState(null);

  const handleDateChange = date => {
    setSelectedDate(date);
  };
  return searchFilterForms ? (
    <Fragment key={searchFilterForms.uuid}>
      <Grid container spacing={3}>
        {searchFilterForms.map((searchFilterForm, index) =>
          (searchFilterForm.type === "RegistrationDate" ||
            searchFilterForm.type === "EnrolmentDate" ||
            searchFilterForm.type === "ProgramEncounterDate" ||
            searchFilterForm.type === "EncounterDate") &&
          searchFilterForm.widget === "Default" ? (
            <Grid item xs={12} key={index}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                  {t(searchFilterForm.titleKey)}
                </Typography>
                <KeyboardDatePicker
                  id="date-picker-dialog"
                  format="dd/MM/yyyy"
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{ width: "30%" }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                    color: "primary"
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          ) : (searchFilterForm.type === "RegistrationDate" ||
              searchFilterForm.type === "EnrolmentDate" ||
              searchFilterForm.type === "ProgramEncounterDate" ||
              searchFilterForm.type === "EncounterDate") &&
            searchFilterForm.widget === "Range" ? (
            <Grid item xs={12} key={index}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                  {t(searchFilterForm.titleKey)}
                </Typography>
                <KeyboardDatePicker
                  id="date-picker-dialog"
                  format="dd/MM/yyyy"
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{ width: "14%", marginRight: "1%" }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                    color: "primary"
                  }}
                />
                <KeyboardDatePicker
                  id="date-picker-dialog"
                  format="dd/MM/yyyy"
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{ width: "14%", marginLeft: "1%" }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                    color: "primary"
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          ) : (
            ""
          )
        )}
      </Grid>
    </Fragment>
  ) : (
    ""
  );
}

NonConceptForm.defaultProps = {
  searchFilterForm: {}
};

export default NonConceptForm;
