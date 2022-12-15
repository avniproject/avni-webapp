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
import _ from "lodash";
import { dateFormat, dateTimeFormat } from "dataEntryApp/constants";

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

function NonCodedConceptForm({ searchFilterForms, selectedConcepts, onChange }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return searchFilterForms ? (
    <Fragment key={searchFilterForms.uuid}>
      <Grid container spacing={3} className={classes.componentSpacing}>
        {searchFilterForms.map((searchFilterForm, index) => {
          const selectedValue = _.head(
            selectedConcepts.filter(
              selectedConcept => selectedConcept.conceptUUID === searchFilterForm.conceptUUID
            )
          );
          return searchFilterForm.type === "Concept" &&
            searchFilterForm.conceptDataType !== "Coded" ? (
            searchFilterForm.conceptDataType === "Text" ? (
              <Grid item xs={12} key={index}>
                <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                  {t(searchFilterForm.titleKey)}
                </Typography>
                <TextField
                  key={index}
                  id={searchFilterForm.titleKey}
                  autoComplete="off"
                  type="text"
                  style={{ width: "30%" }}
                  onChange={event => {
                    event.persist();
                    onChange(event, searchFilterForm);
                  }}
                  value={(!_.isEmpty(selectedValue) && selectedValue.value) || null}
                />
              </Grid>
            ) : searchFilterForm.widget === "Range" ? (
              searchFilterForm.conceptDataType === "Date" ? (
                <Grid item xs={12} key={index}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <KeyboardDatePicker
                      id="date-picker-dialog"
                      placeholder="From"
                      format={dateFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      style={{ width: "14%", marginRight: "1%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                    <KeyboardDatePicker
                      id="date-picker-dialog"
                      placeholder="To"
                      format={dateFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.maxValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "maxValue")}
                      style={{ width: "14%", marginLeft: "1%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "DateTime" ? (
                <Grid item xs={12} key={index}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <KeyboardDateTimePicker
                      id="date-picker-dialog"
                      placeholder="From"
                      format={dateTimeFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      style={{ width: "14%", marginRight: "1%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                    <KeyboardDateTimePicker
                      id="date-picker-dialog"
                      placeholder="To"
                      format={dateTimeFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.maxValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "maxValue")}
                      style={{ width: "14%", marginLeft: "1%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "Time" ? (
                <Grid item xs={12} key={index}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <KeyboardTimePicker
                      id="date-picker-dialog"
                      placeholder="From"
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      style={{ width: "14%", marginRight: "1%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                    <KeyboardTimePicker
                      id="date-picker-dialog"
                      placeholder="To"
                      value={(!_.isEmpty(selectedValue) && selectedValue.maxValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "maxValue")}
                      style={{ width: "14%", marginLeft: "1%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "Numeric" ? (
                <Grid item xs={12} key={index}>
                  <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                    {t(searchFilterForm.titleKey)}
                  </Typography>
                  <TextField
                    key={`minValue_${index}`}
                    id={searchFilterForm.titleKey}
                    autoComplete="off"
                    type="number"
                    placeholder="From"
                    style={{ width: "14%", marginRight: "1%" }}
                    onChange={event => {
                      event.persist();
                      onChange(event, searchFilterForm, "minValue");
                    }}
                    value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                  />
                  <TextField
                    key={`maxValue_${index}`}
                    id={searchFilterForm.titleKey}
                    autoComplete="off"
                    type="number"
                    placeholder="To"
                    style={{ width: "14%", marginLeft: "1%" }}
                    onChange={event => {
                      event.persist();
                      onChange(event, searchFilterForm, "maxValue");
                    }}
                    value={(!_.isEmpty(selectedValue) && selectedValue.maxValue) || null}
                  />
                </Grid>
              ) : (
                ""
              )
            ) : searchFilterForm.widget === "Default" ? (
              searchFilterForm.conceptDataType === "Numeric" ? (
                <Grid item xs={12} key={index}>
                  <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                    {t(searchFilterForm.titleKey)}
                  </Typography>
                  <TextField
                    key={index}
                    id={searchFilterForm.titleKey}
                    autoComplete="off"
                    type="number"
                    style={{ width: "30%" }}
                    onChange={event => {
                      event.persist();
                      onChange(event, searchFilterForm, "minValue");
                    }}
                    value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                  />
                </Grid>
              ) : searchFilterForm.conceptDataType === "Date" ? (
                <Grid item xs={12} key={index}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <KeyboardDatePicker
                      id="date-picker-dialog"
                      format={dateFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      style={{ width: "30%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "DateTime" ? (
                <Grid item xs={12} key={index}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <KeyboardDateTimePicker
                      id="date-picker-dialog"
                      format={dateTimeFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      style={{ width: "30%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "Time" ? (
                <Grid item xs={12} key={index}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <KeyboardTimePicker
                      id="date-picker-dialog"
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      style={{ width: "30%" }}
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
            ) : (
              ""
            )
          ) : (
            ""
          );
        })}
      </Grid>
    </Fragment>
  ) : (
    <div />
  );
}

NonCodedConceptForm.defaultProps = {
  searchFilterForm: {}
};

export default NonCodedConceptForm;
