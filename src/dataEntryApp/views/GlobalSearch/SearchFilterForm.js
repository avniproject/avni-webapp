import React, { Fragment, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams, LineBreak } from "../../../common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { getAllLocations, getGenders, getOrganisationConfig } from "../../reducers/metadataReducer";
import { getSearchFilters } from "../../reducers/searchFilterReducer";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import BasicForm from "../GlobalSearch/BasicForm";
import NonCodedConceptForm from "../GlobalSearch/NonCodedConceptForm";
import NonConceptForm from "../GlobalSearch/NonConceptForm";
import CodedConceptForm from "../GlobalSearch/CodedConceptForm";
import IncludeVoiedForm from "../GlobalSearch/IncludeVoiedForm";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  mainHeading: {
    fontSize: "20px"
  },
  buttons: {
    "& > *": {
      margin: theme.spacing(1)
    }
  }
}));

function SearchFilterFormContainer({
  match,
  operationalModules,
  getSearchFilters,
  searchResults,
  getAllLocations,
  allLocations,
  getGenders,
  genders,
  getOrganisationConfig,
  organisationConfigs
}) {
  // console.log(organisationConfigs);

  useEffect(() => {
    getOrganisationConfig();
    getAllLocations();
    getGenders();
  }, []);

  if (!(operationalModules && allLocations && genders && organisationConfigs)) {
    return <CustomizedBackdrop load={false} />;
  } else {
    return (
      <SearchFilterForm
        match={match}
        operationalModules={operationalModules}
        allLocations={allLocations}
        genders={genders}
        organisationConfigs={organisationConfigs}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    operationalModules: state.dataEntry.metadata.operationalModules,
    searchResults: state.dataEntry.searchFilterReducer.searchFilters,
    allLocations: state.dataEntry.metadata.allLocations,
    genders: state.dataEntry.metadata.genders,
    organisationConfigs: state.dataEntry.metadata.organisationConfigs
  };
};

const mapDispatchToProps = {
  getSearchFilters,
  getAllLocations,
  getGenders,
  getOrganisationConfig
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SearchFilterFormContainer)
  )
);

function SearchFilterForm({
  match,
  operationalModules,
  allLocations,
  genders,
  organisationConfigs
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedSubjectType, setSelectedSubjectType] = useState(
    operationalModules.subjectTypes[0].uuid
  );

  const initialSubjetTypeSearchFilter =
    organisationConfigs &&
    organisationConfigs.organisationConfig.searchFilters &&
    organisationConfigs.organisationConfig.searchFilters.filter(
      searchFilter => searchFilter.subjectTypeUUID === selectedSubjectType
    );
  const [selectedSearchFilter, setSelectedSearchFilter] = useState(initialSubjetTypeSearchFilter);
  const onSubjectTypeChange = event => {
    setSelectedSubjectType(event.target.value);
    const slectedSubjetTypeSearchFilter =
      organisationConfigs.organisationConfig.searchFilters &&
      organisationConfigs.organisationConfig.searchFilters.filter(
        serarchFilter => serarchFilter.subjectTypeUUID === event.target.value
      );
    console.log("slectedSubjetTypeSearchFilter", slectedSubjetTypeSearchFilter);
    setSelectedSearchFilter(slectedSubjetTypeSearchFilter);
  };

  // name age search all
  const [enterValue, setEnterValue] = useState({
    name: "",
    age: "",
    searchAll: ""
  });

  const searchFilterValue = event => {
    const value = event.target.value;
    setEnterValue({
      ...enterValue,
      [event.target.name]: value
    });
  };

  //Gender
  const [selectedGender, setSelectedGender] = React.useState(null);

  const onGenderChange = event => {
    if (event.target.checked) {
      setSelectedGender({ ...selectedGender, [event.target.name]: event.target.checked });
    } else {
      setSelectedGender({ ...selectedGender, [event.target.name]: event.target.checked });
    }
  };

  // address
  const [selectedAddress, setSelectedAddress] = React.useState(null);
  const onAddressSelect = value => {
    setSelectedAddress({ ...selectedAddress, address: value });
  };
  // date
  const [selectedDate, setSelectedDate] = useState({
    RegistrationDate: {
      minValue: null,
      maxValue: null
    },
    EnrolmentDate: {
      minValue: null,
      maxValue: null
    },
    ProgramEncounterDate: {
      minValue: null,
      maxValue: null
    },
    EncounterDate: {
      minValue: null,
      maxValue: null
    }
  });

  const searchFilterDates = (minDate, maxDate, type) => {
    setSelectedDate({
      ...selectedDate,
      [type]: {
        minValue: minDate,
        maxValue: maxDate
      }
    });
  };

  // noncoded concept
  const [selectedConcept, setSelectedConcept] = useState({
    concept: [
      // {
      //   uuid: "",
      //   minValue: null,
      //   maxValue: null,
      //   searchScope:"",
      //   dataType:"",
      //   widget:""
      // }
    ]
  });

  const searchFilterConcept = (minDate, maxDate, searchFilterForm) => {
    const conceptCheck = selectedConcept.concept.filter(
      conceptUUID => conceptUUID.uuid === searchFilterForm.conceptUUID
    );
    conceptCheck.length > 0 && conceptCheck[0].widget === "Default"
      ? setSelectedConcept({
          concept: [
            {
              uuid: searchFilterForm.conceptUUID,
              minValue: minDate,
              maxValue: maxDate,
              searchScope: searchFilterForm.scope,
              dataType: searchFilterForm.conceptDataType,
              widget: searchFilterForm.widget
            }
          ]
        })
      : setSelectedConcept({
          concept: [
            ...selectedConcept.concept,
            {
              uuid: searchFilterForm.conceptUUID,
              minValue: minDate,
              maxValue: maxDate,
              searchScope: searchFilterForm.scope,
              dataType: searchFilterForm.conceptDataType,
              widget: searchFilterForm.widget
            }
          ]
        });
  };

  // is voided
  const [includeVoied, setIncludeVoied] = React.useState(false);

  const includeVoiedChange = event => {
    setIncludeVoied(event.target.checked);
  };

  // const [enterDateValue, setEnterDateValue] = useState(null);
  // console.log("enter value", enterValue);

  // const searchFilterDateValue = date => {
  //   setEnterValue(date);
  // };

  console.log("enter value", enterValue);
  console.log("Gender", selectedGender);
  console.log("Address", selectedAddress);
  console.log("selectedDate", selectedDate);
  console.log("includeVoied", includeVoied);
  console.log("selectedConcept", selectedConcept);

  // const searchResult = (subjectTypeUUID, name) => {
  //   const request = {
  //     subjectType: subjectTypeUUID,
  //     name: name
  //   };
  //   getSearchFilters(request);
  // };

  console.log("orgnization search filter", selectedSearchFilter);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Typography component={"span"} className={classes.mainHeading}>
          Search
        </Typography>
        <LineBreak num={1} />
        <FormControl component="fieldset">
          <FormLabel component="legend">Subject Type</FormLabel>
          <RadioGroup
            row
            aria-label="subjectType"
            name="subjectType"
            onChange={onSubjectTypeChange}
            defaultValue={selectedSubjectType}
          >
            {operationalModules.subjectTypes
              ? operationalModules.subjectTypes.map((subjectType, index) => (
                  <FormControlLabel
                    key={index}
                    value={subjectType.uuid}
                    control={<Radio color="primary" />}
                    label={subjectType.name}
                  />
                ))
              : ""}
          </RadioGroup>
          {selectedSearchFilter && selectedSearchFilter.length > 0 ? (
            <div>
              <Grid container>
                <Grid xs={12}>
                  <BasicForm
                    searchFilterForms={selectedSearchFilter}
                    onChange={searchFilterValue}
                    operationalModules={operationalModules}
                    genders={genders}
                    allLocation={allLocations}
                    onGenderChange={onGenderChange}
                    selectedGender={selectedGender}
                    onAddressSelect={onAddressSelect}
                  />
                </Grid>
                <Grid xs={12}>
                  <NonCodedConceptForm
                    searchFilterForms={selectedSearchFilter}
                    onChange={searchFilterConcept}
                    selectedConcept={selectedConcept}
                  />
                </Grid>
                <Grid xs={12}>
                  <NonConceptForm
                    searchFilterForms={selectedSearchFilter}
                    selectedDate={selectedDate}
                    onDateChange={searchFilterDates}
                  />
                </Grid>
                <Grid xs={12}>
                  <CodedConceptForm
                    searchFilterForms={selectedSearchFilter}
                    onChange={searchFilterValue}
                    conceptList={organisationConfigs.conceptList}
                  />
                </Grid>
                <Grid xs={12}>
                  <IncludeVoiedForm
                    includeVoied={includeVoied}
                    includeVoiedChange={includeVoiedChange}
                  />
                </Grid>
              </Grid>
            </div>
          ) : (
            ""
          )}
          <div className={classes.buttons}>
            <Button
              variant="contained"
              color="primary"
              // onClick={() => searchResult(selectedSubjectType, enterValue)}
              component={Link}
              to="/app/searchResult"
            >
              Search
            </Button>
            <Button variant="contained" color="secondary">
              Cancel
            </Button>
          </div>
        </FormControl>
      </Paper>
    </Fragment>
  );
}
