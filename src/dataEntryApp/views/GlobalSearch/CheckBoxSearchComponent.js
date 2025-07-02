import React, { Fragment } from "react";
import { makeStyles } from "@mui/styles";
import { FormControl, FormControlLabel, Checkbox, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  componentSpacing: {
    marginTop: "1%",
    marginBottom: "1%"
  }
}));

function CheckBoxSearchComponent({ label, checked, onChange }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Fragment>
      <Grid container spacing={3} className={classes.componentSpacing}>
        <Grid size={12}>
          <FormControl component="fieldset">
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={onChange} color="primary" />}
              label={t(label)}
              labelPlacement="end"
            />
          </FormControl>
        </Grid>
      </Grid>
    </Fragment>
  );
}

export default CheckBoxSearchComponent;
