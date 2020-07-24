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
        getSearchFilters={getSearchFilters}
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
  organisationConfigs,
  getSearchFilters
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

  const SelectedGenderSort =
    selectedGender != null
      ? Object.keys(selectedGender)
          .filter(selectedId => selectedGender[selectedId])
          .map(String)
      : [];

  console.log("SelectedGenderSort", SelectedGenderSort);

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

  const conceptList =
    organisationConfigs &&
    organisationConfigs.organisationConfig.searchFilters.filter(
      searchElement => searchElement.type === "Concept"
    );

  // console.log("conceptList", conceptList);
  const InitialConceptList = conceptList.map(concept => {
    if (concept.conceptDataType === null) {
    } else {
      if (["Date", "DateTime", "Time", "Numeric"].includes(concept.conceptDataType)) {
        return {
          ...concept,
          minValue: null,
          maxValue: null
        };
      } else if (concept.conceptDataType === "Coded") {
        return {
          ...concept,
          values: []
        };
      } else if (["Text", "Notes"].includes(concept.conceptDataType)) {
        return {
          ...concept,
          value: ""
        };
      }
    }
  });

  const [selectedConcept, setSelectedConcept] = useState(InitialConceptList);
  const [selectedCodedValue, setSelectedCodedValue] = useState(null);
  const searchFilterConcept = (
    event,
    searchFilterForm,
    fieldName,
    selectedValue,
    selectedConcepts
  ) => {
    console.log("fieldName", fieldName);
    console.log("selectedValue", selectedValue);
    console.log("cuurent state", selectedConcept);
    setSelectedConcept(
      selectedConcept.map(conceptElement => {
        const concept = conceptElement;
        if (concept.conceptDataType === null) {
        } else {
          if (["Date", "DateTime", "Time", "Numeric"].includes(concept.conceptDataType)) {
            if (concept.conceptUUID === searchFilterForm.conceptUUID) {
              return {
                ...concept,
                [fieldName]: selectedValue
              };
            } else {
              return {
                ...concept
              };
            }
          } else if (concept.conceptDataType === "Coded") {
            if (concept.conceptUUID === searchFilterForm.conceptUUID) {
              setSelectedCodedValue({
                ...selectedCodedValue,
                [event.target.name]: event.target.checked
              });
              return {
                ...concept,
                values:
                  selectedCodedValue != null
                    ? Object.keys(selectedCodedValue)
                        .filter(selectedId => selectedCodedValue[selectedId])
                        .map(String)
                    : []
              };
            } else {
              return {
                ...concept
              };
            }
          } else if (["Text", "Notes"].includes(concept.conceptDataType)) {
            if (concept.conceptUUID === searchFilterForm.conceptUUID) {
              return {
                ...concept,
                value: event.target.value
              };
            } else {
              return {
                ...concept
              };
            }
          }
        }
      })
    );
  };
  // is voided
  const [includeVoied, setIncludeVoied] = React.useState(false);

  const includeVoiedChange = event => {
    setIncludeVoied(event.target.checked);
  };

  console.log("enter value", enterValue);
  console.log("Gender", selectedGender);
  console.log("Address", selectedAddress);
  console.log("selectedDate", selectedDate);
  console.log("includeVoied", includeVoied);
  console.log("selectedConcept", selectedConcept);

  const searchResult = (subjectTypeUUID, enterValue) => {
    const request = {
      subjectType: "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3",
      name: enterValue.name,
      age: {
        minValue: 5,
        maxValue: null
      },
      includeVoided: includeVoied,
      addressIds: [23],
      concept: [],
      gender: ["ad7d1d14-54fd-45a2-86b7-ea329b744484", "840de9fb-e565-4d7d-b751-90335ba20490"],
      registrationDate: {
        minValue: "2020-01-13",
        maxValue: "2020-02-29"
      },
      encounterDate: {
        minValue: "2020-01-13",
        maxValue: "2020-02-29"
      },
      programEncounterDate: {
        minValue: "2020-01-13",
        maxValue: "2020-02-29"
      },
      programEnrolmentDate: {
        minValue: "2020-01-13",
        maxValue: "2020-02-29"
      },
      searchAll: "",
      pageElement: {
        pageNumber: 1,
        numberOfRecordPerPage: 10,
        sortColumn: "first_name",
        sortOrder: "ASC"
      }
    };
    // const request = {
    //   subjectType: subjectTypeUUID,
    //   name: enterValue.name,
    //   age: {
    //     minValue: 0,
    //     maxValue: 0
    //   },
    //   includeVoided: true,
    //   addressIds: [],
    //   concept: [],
    //   gender: [],
    //   registrationDate: {
    //     minValue: "",
    //     maxValue: ""
    //   },
    //   encounterDate: {
    //     minValue: "",
    //     maxValue: ""
    //   },
    //   programEncounterDate: {
    //     minValue: "",
    //     maxValue: ""
    //   },
    //   programEnrolmentDate: {
    //     minValue: "",
    //     maxValue: ""
    //   },
    //   searchAll: "",
    //   pageElement: {
    //     pageNumber: 1,
    //     numberOfRecordPerPage: 10,
    //     sortColumn: "first_name",
    //     sortOrder: "ASC"
    //   }
    // };
    getSearchFilters(request);
  };

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
                    conceptList={organisationConfigs.conceptList}
                    onChange={searchFilterConcept}
                    selectedConcept={selectedConcept}
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
              onClick={() => searchResult(selectedSubjectType, enterValue)}
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
