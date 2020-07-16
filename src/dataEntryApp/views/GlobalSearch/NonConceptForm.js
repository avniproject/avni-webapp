import React, { Fragment } from "react";
import { TextField, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";

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
  return searchFilterForms ? (
    <Fragment className={classes.root}>
      <Grid container spacing={3}>
        {searchFilterForms.map(searchFilterForm =>
          (searchFilterForm.type === "RegistrationDate" ||
            searchFilterForm.type === "EnrolmentDate" ||
            searchFilterForm.type === "ProgramEncounterDate" ||
            searchFilterForm.type === "EncounterDate") &&
          searchFilterForm.widget === "Default" ? (
            <Grid item xs={6}>
              <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                {t(searchFilterForm.titleKey)}
              </Typography>
              <TextField
                id={searchFilterForm.titleKey}
                autoComplete="off"
                type="text"
                style={{ width: "100%" }}
                onChange={onChange}
              />
            </Grid>
          ) : (searchFilterForm.type === "RegistrationDate" ||
              searchFilterForm.type === "EnrolmentDate" ||
              searchFilterForm.type === "ProgramEncounterDate" ||
              searchFilterForm.type === "EncounterDate") &&
            searchFilterForm.widget === "Range" ? (
            <Grid item xs={6}>
              <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                {t(searchFilterForm.titleKey)}
              </Typography>
              <TextField
                id={searchFilterForm.titleKey}
                autoComplete="off"
                type="text"
                style={{ width: "100%" }}
                onChange={onChange}
              />
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
