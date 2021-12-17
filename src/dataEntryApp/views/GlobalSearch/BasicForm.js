import React, { Fragment } from "react";
import { TextField, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControl from "@material-ui/core/FormControl";
import Select from "react-select";
import { locationNameRenderer } from "../../utils/LocationUtil";
import { find } from "lodash";

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
  operationalModules,
  genders,
  allLocation,
  onGenderChange,
  selectedGender,
  onAddressSelect,
  selectedAddress,
  selectedAddressLevelType,
  enterValue,
  setSelectedAddressLevelType
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const onAddressLevelTypeChange = event => {
    setSelectedAddressLevelType(event.target.value);
    onAddressSelect(null);
  };
  const locations = allLocation.filter(
    location => location.type === selectedAddressLevelType && !location.voided
  );

  function renderSearchAll(index, titleKey) {
    return (
      <Grid item key={index}>
        <Typography variant="body1" gutterBottom className={classes.lableStyle}>
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
            <Grid item key={index}>
              <Typography variant="body1" gutterBottom className={classes.lableStyle}>
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
            <Grid item key={index}>
              <Typography variant="body1" gutterBottom className={classes.lableStyle}>
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
          searchFilterForm.type === "SearchAll"
            ? renderSearchAll(index, searchFilterForm.titleKey)
            : ""
        )}
      </Grid>
      <Grid container spacing={3} className={classes.componentSpacing}>
        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Gender" ? (
            <Grid item xs={12} key={index}>
              <Typography variant="body1" gutterBottom className={classes.lableStyle}>
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
            <Grid item xs={12} key={index}>
              <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                {t(searchFilterForm.titleKey)}
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="position"
                  name="position"
                  onChange={onAddressLevelTypeChange}
                  value={selectedAddressLevelType}
                >
                  {operationalModules.addressLevelTypes
                    ? operationalModules.addressLevelTypes.map((addressLevelType, index) => (
                        <FormControlLabel
                          key={index}
                          value={addressLevelType.name}
                          control={<Radio color="primary" />}
                          label={t(addressLevelType.name)}
                        />
                      ))
                    : ""}
                </RadioGroup>
              </FormControl>
              <Select
                isMulti
                placeholder={t("selectAddress")}
                value={selectedAddress}
                options={locations.map(location => ({
                  label: location.name,
                  value: location.id,
                  optionLabel: locationNameRenderer(location)
                }))}
                onChange={onAddressSelect}
                formatOptionLabel={({ optionLabel }) => <div>{optionLabel}</div>}
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
