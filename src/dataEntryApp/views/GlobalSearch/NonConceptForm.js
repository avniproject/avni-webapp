import React, { Fragment } from "react";
import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { dateFormat } from "dataEntryApp/constants";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  lableStyle: {
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.54)"
  },
  componentSpacing: {
    marginTop: "1%",
    marginBottom: "1%"
  }
}));

function NonConceptForm({ searchFilterForms, selectedDate, onDateChange }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return searchFilterForms ? (
    <Fragment key={searchFilterForms.uuid}>
      <Grid container spacing={3} className={classes.componentSpacing}>
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
                  format={dateFormat}
                  value={selectedDate[`${searchFilterForm.type}`].minValue}
                  onChange={minDate => onDateChange(minDate, null, searchFilterForm.type)}
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
                  format={dateFormat}
                  placeholder="From"
                  value={selectedDate[`${searchFilterForm.type}`].minValue}
                  onChange={minDate =>
                    onDateChange(
                      minDate,
                      selectedDate[`${searchFilterForm.type}`].maxValue !== null
                        ? selectedDate[`${searchFilterForm.type}`].maxValue
                        : null,
                      searchFilterForm.type
                    )
                  }
                  style={{ width: "14%", marginRight: "1%" }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                    color: "primary"
                  }}
                />
                <KeyboardDatePicker
                  id="date-picker-dialog"
                  format={dateFormat}
                  placeholder="To"
                  value={selectedDate[`${searchFilterForm.type}`].maxValue}
                  onChange={maxDate =>
                    onDateChange(
                      selectedDate[`${searchFilterForm.type}`].minValue !== null
                        ? selectedDate[`${searchFilterForm.type}`].minValue
                        : null,
                      maxDate,
                      searchFilterForm.type
                    )
                  }
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
    <div />
  );
}

NonConceptForm.defaultProps = {
  searchFilterForm: {}
};

export default NonConceptForm;
