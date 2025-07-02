import React, { Fragment } from "react";
import { makeStyles } from "@mui/styles";
import { TextField, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { DatePicker, DateTimePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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
            selectedConcepts.filter(selectedConcept => selectedConcept.conceptUUID === searchFilterForm.conceptUUID)
          );
          return searchFilterForm.type === "Concept" && searchFilterForm.conceptDataType !== "Coded" ? (
            ["Text", "Id"].includes(searchFilterForm.conceptDataType) ? (
              <Grid key={index} size={12}>
                <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
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
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <DatePicker
                      id="date-picker-dialog"
                      format={dateFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      renderInput={params => <TextField {...params} placeholder="From" style={{ width: "14%", marginRight: "1%" }} />}
                      slotProps={{
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                    <DatePicker
                      id="date-picker-dialog"
                      format={dateFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.maxValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "maxValue")}
                      renderInput={params => <TextField {...params} placeholder="To" style={{ width: "14%", marginLeft: "1%" }} />}
                      slotProps={{
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "DateTime" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <DateTimePicker
                      id="date-picker-dialog"
                      format={dateTimeFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      renderInput={params => <TextField {...params} placeholder="From" style={{ width: "14%", marginRight: "1%" }} />}
                      slotProps={{
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                    <DateTimePicker
                      id="date-picker-dialog"
                      format={dateTimeFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.maxValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "maxValue")}
                      renderInput={params => <TextField {...params} placeholder="To" style={{ width: "14%", marginLeft: "1%" }} />}
                      slotProps={{
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "Time" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <TimePicker
                      id="date-picker-dialog"
                      format="HH:mm"
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      renderInput={params => <TextField {...params} placeholder="From" style={{ width: "14%", marginRight: "1%" }} />}
                      slotProps={{
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                    <TimePicker
                      id="date-picker-dialog"
                      format="HH:mm"
                      value={(!_.isEmpty(selectedValue) && selectedValue.maxValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "maxValue")}
                      renderInput={params => <TextField {...params} placeholder="To" style={{ width: "14%", marginLeft: "1%" }} />}
                      slotProps={{
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "Numeric" ? (
                <Grid key={index} size={12}>
                  <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
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
                <Grid key={index} size={12}>
                  <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
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
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <DatePicker
                      id="date-picker-dialog"
                      format={dateFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      renderInput={params => <TextField {...params} style={{ width: "30%" }} />}
                      slotProps={{
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "DateTime" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <DateTimePicker
                      id="date-picker-dialog"
                      format={dateTimeFormat}
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      renderInput={params => <TextField {...params} style={{ width: "30%" }} />}
                      slotProps={{
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "Time" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <TimePicker
                      id="date-picker-dialog"
                      format="HH:mm"
                      value={(!_.isEmpty(selectedValue) && selectedValue.minValue) || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      renderInput={params => <TextField {...params} style={{ width: "30%" }} />}
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
