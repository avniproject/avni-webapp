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

function NonCodedConceptForm({ searchFilterForms, onChange }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return searchFilterForms ? (
    <Fragment className={classes.root}>
      <Grid container spacing={3}>
        {searchFilterForms.map(searchFilterForm =>
          searchFilterForm.type === "Concept" &&
          searchFilterForm.conceptDataType !== "Coded" &&
          searchFilterForm.widget === "Default" ? (
            searchFilterForm.conceptDataType === "Text" ? (
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
            ) : searchFilterForm.conceptDataType === "Date" ? (
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
          ) : searchFilterForm.type === "Concept" &&
            searchFilterForm.conceptDataType !== "Coded" &&
            searchFilterForm.widget === "Range" ? (
            searchFilterForm.conceptDataType === "Date" ? (
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
