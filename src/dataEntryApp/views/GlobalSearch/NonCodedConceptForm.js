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
  },
  componentSpacing: {
    marginTop: "1%",
    marginBottom: "1%"
  }
}));

function NonCodedConceptForm({ searchFilterForms, selectedConcept, onChange }) {
  const classes = useStyles();
  const { t } = useTranslation();
  // const [value, setvalue] = React.useState(null);

  return searchFilterForms ? (
    <Fragment key={searchFilterForms.uuid}>
      <Grid container spacing={3} className={classes.componentSpacing}>
        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Concept" && searchFilterForm.conceptDataType !== "Coded" ? (
            searchFilterForm.widget === "Range" ? (
              searchFilterForm.conceptDataType === "Date" ? (
                <Grid item xs={12} key={index}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <KeyboardDatePicker
                      id="date-picker-dialog"
                      format="dd/MM/yyyy"
                      value={
                        selectedConcept.concept.filter(
                          concept => concept.uuid === searchFilterForm.conceptUUID
                        ).length > 0
                          ? selectedConcept.concept.filter(
                              concept => concept.uuid === searchFilterForm.conceptUUID
                            )[0].minValue
                          : null
                      }
                      onChange={minDate =>
                        onChange(
                          minDate,
                          selectedConcept.concept.filter(
                            concept => concept.uuid === searchFilterForm.conceptUUID
                          ).length > 0
                            ? selectedConcept.concept.filter(
                                concept => concept.uuid === searchFilterForm.conceptUUID
                              )[0].maxValue
                            : null,
                          searchFilterForm
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
                      format="dd/MM/yyyy"
                      value={
                        selectedConcept.concept.filter(
                          concept => concept.uuid === searchFilterForm.conceptUUID
                        ).length > 0
                          ? selectedConcept.concept.filter(
                              concept => concept.uuid === searchFilterForm.conceptUUID
                            )[0].maxValue
                          : null
                      }
                      onChange={maxDate =>
                        onChange(
                          selectedConcept.concept.filter(
                            concept => concept.uuid === searchFilterForm.conceptUUID
                          ).length > 0
                            ? selectedConcept.concept.filter(
                                concept => concept.uuid === searchFilterForm.conceptUUID
                              )[0].minValue
                            : null,
                          maxDate,
                          searchFilterForm
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
              ) : searchFilterForm.conceptDataType === "DateTime" ? (
                <Grid item xs={12} key={index}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <KeyboardDateTimePicker
                      id="date-picker-dialog"
                      format="dd/MM/yyyy HH:mm"
                      value={
                        selectedConcept.concept.filter(
                          concept => concept.uuid === searchFilterForm.conceptUUID
                        ).length > 0
                          ? selectedConcept.concept.filter(
                              concept => concept.uuid === searchFilterForm.conceptUUID
                            )[0].minValue
                          : null
                      }
                      onChange={minDate =>
                        onChange(
                          minDate,
                          selectedConcept.concept.filter(
                            concept => concept.uuid === searchFilterForm.conceptUUID
                          ).length > 0
                            ? selectedConcept.concept.filter(
                                concept => concept.uuid === searchFilterForm.conceptUUID
                              )[0].maxValue
                            : null,
                          searchFilterForm
                        )
                      }
                      style={{ width: "14%", marginRight: "1%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                    <KeyboardDateTimePicker
                      id="date-picker-dialog"
                      format="dd/MM/yyyy HH:mm"
                      value={
                        selectedConcept.concept.filter(
                          concept => concept.uuid === searchFilterForm.conceptUUID
                        ).length > 0
                          ? selectedConcept.concept.filter(
                              concept => concept.uuid === searchFilterForm.conceptUUID
                            )[0].maxValue
                          : null
                      }
                      onChange={maxDate =>
                        onChange(
                          selectedConcept.concept.filter(
                            concept => concept.uuid === searchFilterForm.conceptUUID
                          ).length > 0
                            ? selectedConcept.concept.filter(
                                concept => concept.uuid === searchFilterForm.conceptUUID
                              )[0].minValue
                            : null,
                          maxDate,
                          searchFilterForm
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
              ) : searchFilterForm.conceptDataType === "Time" ? (
                <Grid item xs={12} key={index}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t(searchFilterForm.titleKey)}
                    </Typography>
                    <KeyboardTimePicker
                      id="date-picker-dialog"
                      value={
                        selectedConcept.concept.filter(
                          concept => concept.uuid === searchFilterForm.conceptUUID
                        ).length > 0
                          ? selectedConcept.concept.filter(
                              concept => concept.uuid === searchFilterForm.conceptUUID
                            )[0].minValue
                          : null
                      }
                      onChange={minDate =>
                        onChange(
                          minDate,
                          selectedConcept.concept.filter(
                            concept => concept.uuid === searchFilterForm.conceptUUID
                          ).length > 0
                            ? selectedConcept.concept.filter(
                                concept => concept.uuid === searchFilterForm.conceptUUID
                              )[0].maxValue
                            : null,
                          searchFilterForm
                        )
                      }
                      style={{ width: "14%", marginRight: "1%" }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                        color: "primary"
                      }}
                    />
                    <KeyboardTimePicker
                      id="date-picker-dialog"
                      value={
                        selectedConcept.concept.filter(
                          concept => concept.uuid === searchFilterForm.conceptUUID
                        ).length > 0
                          ? selectedConcept.concept.filter(
                              concept => concept.uuid === searchFilterForm.conceptUUID
                            )[0].maxValue
                          : null
                      }
                      onChange={maxDate =>
                        onChange(
                          selectedConcept.concept.filter(
                            concept => concept.uuid === searchFilterForm.conceptUUID
                          ).length > 0
                            ? selectedConcept.concept.filter(
                                concept => concept.uuid === searchFilterForm.conceptUUID
                              )[0].minValue
                            : null,
                          maxDate,
                          searchFilterForm
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
            ) : searchFilterForm.conceptDataType === "Text" ||
              searchFilterForm.conceptDataType === "Notes" ? (
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
                  onChange={onChange}
                />
              </Grid>
            ) : searchFilterForm.conceptDataType === "Duration" ? (
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
                  onChange={onChange}
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
                    format="dd/MM/yyyy"
                    value={
                      selectedConcept.concept.filter(
                        concept => concept.uuid === searchFilterForm.conceptUUID
                      ).length > 0
                        ? selectedConcept.concept.filter(
                            concept => concept.uuid === searchFilterForm.conceptUUID
                          )[0].minValue
                        : null
                    }
                    onChange={minDate => onChange(minDate, null, searchFilterForm)}
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
                    format="dd/MM/yyyy HH:mm"
                    value={
                      selectedConcept.concept.filter(
                        concept => concept.uuid === searchFilterForm.conceptUUID
                      ).length > 0
                        ? selectedConcept.concept.filter(
                            concept => concept.uuid === searchFilterForm.conceptUUID
                          )[0].minValue
                        : null
                    }
                    onChange={minDate => onChange(minDate, null, searchFilterForm)}
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
                    value={
                      selectedConcept.concept.filter(
                        concept => concept.uuid === searchFilterForm.conceptUUID
                      ).length > 0
                        ? selectedConcept.concept.filter(
                            concept => concept.uuid === searchFilterForm.conceptUUID
                          )[0].minValue
                        : null
                    }
                    onChange={minDate => onChange(minDate, null, searchFilterForm)}
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
        )}
      </Grid>
    </Fragment>
  ) : (
    ""
  );
}

NonCodedConceptForm.defaultProps = {
  searchFilterForm: {}
};

export default NonCodedConceptForm;
