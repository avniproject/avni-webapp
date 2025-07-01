import React, { Fragment } from "react";
import { makeStyles } from "@mui/styles";
import { TextField, Typography } from "@mui/material";
import { GridLegacy as Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                  {t(searchFilterForm.titleKey)}
                </Typography>
                <DatePicker
                  id="date-picker-dialog"
                  format={dateFormat}
                  value={selectedDate[`${searchFilterForm.type}`].minValue}
                  onChange={minDate => onDateChange(minDate, null, searchFilterForm.type)}
                  renderInput={params => <TextField {...params} style={{ width: "30%" }} />}
                  slotProps={{
                    actionBar: { actions: ["clear"] },
                    openPickerButton: { "aria-label": "change date", color: "primary" }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          ) : (searchFilterForm.type === "RegistrationDate" ||
              searchFilterForm.type === "EnrolmentDate" ||
              searchFilterForm.type === "ProgramEncounterDate" ||
              searchFilterForm.type === "EncounterDate") &&
            searchFilterForm.widget === "Range" ? (
            <Grid item xs={12} key={index}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                  {t(searchFilterForm.titleKey)}
                </Typography>
                <DatePicker
                  id="date-picker-dialog"
                  format={dateFormat}
                  placeholder="From"
                  value={selectedDate[`${searchFilterForm.type}`].minValue}
                  onChange={minDate =>
                    onDateChange(
                      minDate,
                      selectedDate[`${searchFilterForm.type}`].maxValue !== null ? selectedDate[`${searchFilterForm.type}`].maxValue : null,
                      searchFilterForm.type
                    )
                  }
                  renderInput={params => <TextField {...params} placeholder="From" style={{ width: "14%", marginRight: "1%" }} />}
                  slotProps={{
                    actionBar: { actions: ["clear"] },
                    openPickerButton: { "aria-label": "change date", color: "primary" }
                  }}
                />
                <DatePicker
                  id="date-picker-dialog"
                  format={dateFormat}
                  placeholder="To"
                  value={selectedDate[`${searchFilterForm.type}`].maxValue}
                  onChange={maxDate =>
                    onDateChange(
                      selectedDate[`${searchFilterForm.type}`].minValue !== null ? selectedDate[`${searchFilterForm.type}`].minValue : null,
                      maxDate,
                      searchFilterForm.type
                    )
                  }
                  renderInput={params => <TextField {...params} placeholder="To" style={{ width: "14%", marginLeft: "1%" }} />}
                  slotProps={{
                    actionBar: { actions: ["clear"] },
                    openPickerButton: { "aria-label": "change date", color: "primary" }
                  }}
                />
              </LocalizationProvider>
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
