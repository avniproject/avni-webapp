import React, { Fragment, useState } from "react";
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
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  lableStyle: {
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.54)"
  }
}));

function BasicForm({ searchFilterForms, onChange, operationalModules, genders, allLocation }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [selectedAddressLevelType, setSelectedAddressLevelType] = useState("Address");
  const onAddressLevelTypeChange = event => {
    console.log(event.target.value);
    setSelectedAddressLevelType(event.target.value);
  };
  const location = allLocation._embedded.locations.filter(
    locationType => locationType.typeString === selectedAddressLevelType
  );

  console.log(location);
  return searchFilterForms ? (
    <Fragment className={classes.root}>
      <Grid container spacing={3}>
        {searchFilterForms.map(searchFilterForm =>
          searchFilterForm.type === "Name" ? (
            <Grid item xs={3}>
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

        {searchFilterForms.map(searchFilterForm =>
          searchFilterForm.type === "Age" ? (
            <Grid item xs={3}>
              <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                {t(searchFilterForm.titleKey)}
              </Typography>
              <TextField
                id={searchFilterForm.titleKey}
                autoComplete="off"
                type="number"
                style={{ width: "100%" }}
                onChange={onChange}
              />
            </Grid>
          ) : (
            ""
          )
        )}

        {searchFilterForms.map(searchFilterForm =>
          searchFilterForm.type === "SearchAll" ? (
            <Grid item xs={3}>
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
      <Grid container spacing={3}>
        {searchFilterForms.map(searchFilterForm =>
          searchFilterForm.type === "Gender" ? (
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                {t(searchFilterForm.titleKey)}
              </Typography>
              <FormGroup row>
                {genders.map(gender => (
                  <FormControlLabel
                    control={<Checkbox onChange={onChange} name="male" color="primary" />}
                    label={gender.name}
                  />
                ))}
              </FormGroup>
            </Grid>
          ) : (
            ""
          )
        )}
      </Grid>

      <Grid container spacing={3}>
        {searchFilterForms.map(searchFilterForm =>
          searchFilterForm.type === "Address" ? (
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                {t(searchFilterForm.titleKey)}
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="position"
                  name="position"
                  onChange={onAddressLevelTypeChange}
                  defaultValue={selectedAddressLevelType}
                >
                  {operationalModules.addressLevelTypes
                    ? operationalModules.addressLevelTypes.map(addressLevelType => (
                        <FormControlLabel
                          value={addressLevelType.name}
                          control={<Radio color="primary" />}
                          label={addressLevelType.name}
                        />
                      ))
                    : ""}
                </RadioGroup>
              </FormControl>
              <Autocomplete
                multiple
                id="checkboxes-tags-demo"
                options={location}
                disableCloseOnSelect
                getOptionLabel={option => option.title}
                renderOption={(option, { selected }) => (
                  <React.Fragment>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.title}
                  </React.Fragment>
                )}
                style={{ width: 500 }}
                renderInput={params => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label={selectedAddressLevelType}
                    placeholder={selectedAddressLevelType}
                  />
                )}
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

BasicForm.defaultProps = {
  searchFilterForm: {}
};

export default BasicForm;
