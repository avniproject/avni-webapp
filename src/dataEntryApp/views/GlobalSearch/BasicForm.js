import React, { Fragment } from "react";
import { makeStyles } from "@mui/styles";
import { TextField, Typography, Grid, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useTranslation } from "react-i18next";
import { find } from "lodash";
import AddressLevelsByType from "../../../common/components/AddressLevelsByType";

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

function BasicForm({
  searchFilterForms,
  onChange,
  genders,
  onGenderChange,
  selectedGender,
  enterValue,
  addressLevelIds,
  setAddressLevelIds
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  function renderSearchAll(index, titleKey) {
    return (
      <Grid key={index}>
        <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
          {t(titleKey)}
        </Typography>
        <TextField
          id={titleKey}
          key={index}
          autoComplete="off"
          name="searchAll"
          type="text"
          style={{ width: "100%" }}
          onChange={onChange}
          value={enterValue.searchAll}
        />
      </Grid>
    );
  }

  const isFilterConfigured = !!find(searchFilterForms, sff => sff.type);

  return isFilterConfigured ? (
    <Fragment>
      <Grid container spacing={3} className={classes.componentSpacing}>
        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Name" ? (
            <Grid key={index}>
              <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                {t(searchFilterForm.titleKey)}
              </Typography>
              <TextField
                id={searchFilterForm.titleKey}
                key={index}
                name="name"
                autoComplete="off"
                type="text"
                style={{ width: "100%" }}
                onChange={onChange}
                value={enterValue.name}
              />
            </Grid>
          ) : (
            ""
          )
        )}

        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Age" ? (
            <Grid key={index}>
              <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                {t(searchFilterForm.titleKey)}
              </Typography>
              <TextField
                id={searchFilterForm.titleKey}
                key={index}
                autoComplete="off"
                name="age"
                type="number"
                style={{ width: "100%" }}
                onChange={onChange}
                value={enterValue.age}
              />
            </Grid>
          ) : (
            ""
          )
        )}

        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "SearchAll" ? renderSearchAll(index, searchFilterForm.titleKey) : ""
        )}
      </Grid>
      <Grid container spacing={3} className={classes.componentSpacing}>
        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Gender" ? (
            <Grid key={index} size={12}>
              <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                {t(searchFilterForm.titleKey)}
              </Typography>
              <FormGroup row>
                {genders.map((gender, index) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedGender != null ? selectedGender[gender.uuid] : false}
                        onChange={onGenderChange}
                        name={gender.uuid}
                        color="primary"
                      />
                    }
                    label={t(gender.name)}
                    key={index}
                  />
                ))}
              </FormGroup>
            </Grid>
          ) : (
            ""
          )
        )}
      </Grid>

      <Grid container spacing={3} className={classes.componentSpacing}>
        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Address" ? (
            <Grid key={index} size={12}>
              <AddressLevelsByType
                label={t(searchFilterForm.titleKey)}
                addressLevelsIds={addressLevelIds}
                setAddressLevelsIds={setAddressLevelIds}
              />
            </Grid>
          ) : (
            ""
          )
        )}
      </Grid>
    </Fragment>
  ) : (
    <Grid container spacing={3} className={classes.componentSpacing}>
      {renderSearchAll(1, "searchAll")}
    </Grid>
  );
}

BasicForm.defaultProps = {
  searchFilterForm: {}
};

export default BasicForm;
