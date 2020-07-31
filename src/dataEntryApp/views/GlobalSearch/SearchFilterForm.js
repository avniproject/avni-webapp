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
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import BasicForm from "../GlobalSearch/BasicForm";
import NonCodedConceptForm from "../GlobalSearch/NonCodedConceptForm";
import NonConceptForm from "../GlobalSearch/NonConceptForm";
import CodedConceptForm from "../GlobalSearch/CodedConceptForm";
import IncludeVoiedForm from "../GlobalSearch/IncludeVoiedForm";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import Grid from "@material-ui/core/Grid";
import moment from "moment/moment";
import { store } from "../../../common/store/createStore";
import { types } from "../../reducers/searchFilterReducer";

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
  getAllLocations,
  allLocations,
  getGenders,
  genders,
  getOrganisationConfig,
  organisationConfigs
}) {
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
    allLocations: state.dataEntry.metadata.allLocations,
    genders: state.dataEntry.metadata.genders,
    organisationConfigs: state.dataEntry.metadata.organisationConfigs
  };
};

const mapDispatchToProps = {
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

  const selectedGenderSort =
    selectedGender != null
      ? Object.keys(selectedGender)
          .filter(selectedId => selectedGender[selectedId])
          .map(String)
      : [];

  // address
  const [selectedAddress, setSelectedAddress] = React.useState(null);
  const onAddressSelect = (event, value) => {
    setSelectedAddress({ ...selectedAddress, address: value });
  };
  const selectedAddressSort =
    selectedAddress !== null ? selectedAddress.address.map(address => address.id) : [];
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
        minValue: minDate !== null ? moment(minDate).format("YYYY-MM-DD") : null,
        maxValue: maxDate !== null ? moment(maxDate).format("YYYY-MM-DD") : null
      }
    });
  };

  const conceptList = selectedSearchFilter.filter(
    searchElement => searchElement.type === "Concept"
  );

  const InitialConceptList = conceptList.map(concept => {
    if (concept.conceptDataType === null) {
    } else {
      if (["Date", "DateTime", "Time"].includes(concept.conceptDataType)) {
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
      } else if (concept.conceptDataType === "Text") {
        return {
          ...concept,
          value: ""
        };
      } else if (concept.conceptDataType === "Numeric") {
        return {
          ...concept,
          minValue: null,
          maxValue: null
        };
      }
    }
  });

  const [selectedConcepts, setSelectedConcept] = useState(InitialConceptList);
  const searchFilterConcept = (event, searchFilterForm, fieldName) => {
    console.log("selectedConcepts", selectedConcepts);
    setSelectedConcept(previousSelectedConcepts =>
      previousSelectedConcepts.map(concept => {
        if (concept.conceptDataType === null) {
        } else {
          if (["Date", "DateTime", "Time"].includes(concept.conceptDataType)) {
            if (concept.conceptUUID === searchFilterForm.conceptUUID) {
              return {
                ...concept,
                [fieldName]: event
              };
            } else {
              return {
                ...concept
              };
            }
          } else if (concept.conceptDataType === "Coded") {
            if (concept.conceptUUID === searchFilterForm.conceptUUID) {
              const selectedCodedValue = {};
              concept.values.forEach(element => {
                selectedCodedValue[element] = true;
              });
              selectedCodedValue[event.target.name] = event.target.checked;

              return {
                ...concept,
                values: Object.keys(selectedCodedValue).filter(
                  selectedId => selectedCodedValue[selectedId]
                )
              };
            } else {
              return {
                ...concept
              };
            }
          } else if (concept.conceptDataType === "Text") {
            if (concept.conceptUUID === searchFilterForm.conceptUUID) {
              const selectedText = event.target.value;
              return {
                ...concept,
                value: selectedText
              };
            } else {
              return {
                ...concept
              };
            }
          } else if (concept.conceptDataType === "Numeric") {
            if (concept.conceptUUID === searchFilterForm.conceptUUID) {
              const slectedNumeric = event.target.value;
              return {
                ...concept,
                [fieldName]: slectedNumeric
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
  //concept
  const selectedConceptApi = selectedConcepts.filter(selectedConcept => {
    if (selectedConcept.conceptDataType === null) {
    } else {
      if (["Date", "DateTime", "Time"].includes(selectedConcept.conceptDataType)) {
        if (selectedConcept.widget === "Range") {
          return selectedConcept.minValue && selectedConcept.maxValue;
        } else {
          return selectedConcept.minValue;
        }
      } else if (selectedConcept.conceptDataType === "Coded" && selectedConcept.values.length > 0) {
        return selectedConcept.values;
      } else if (selectedConcept.conceptDataType === "Text") {
        return selectedConcept.value;
      } else if (selectedConcept.conceptDataType === "Numeric") {
        if (selectedConcept.widget === "Range") {
          return selectedConcept.minValue && selectedConcept.maxValue;
        } else {
          return selectedConcept.minValue;
        }
      }
    }
  });

  const conceptRequests = selectedConceptApi.map(conceptRequest => {
    if (["Date", "DateTime", "Time"].includes(conceptRequest.conceptDataType)) {
      return {
        uuid: conceptRequest.conceptUUID,
        minValue:
          conceptRequest.minValue !== null
            ? moment(conceptRequest.minValue).format("YYYY-MM-DD")
            : null,
        maxValue:
          conceptRequest.maxValue !== null
            ? moment(conceptRequest.maxValue).format("YYYY-MM-DD")
            : null,
        searchScope: conceptRequest.scope,
        dataType: conceptRequest.conceptDataType,
        widget: conceptRequest.widget
      };
    } else if (conceptRequest.conceptDataType === "Coded") {
      return {
        uuid: conceptRequest.conceptUUID,
        searchScope: conceptRequest.scope,
        dataType: conceptRequest.conceptDataType,
        widget: conceptRequest.widget,
        values: conceptRequest.values
      };
    } else if (conceptRequest.conceptDataType === "Text") {
      return {
        uuid: conceptRequest.conceptUUID,
        searchScope: conceptRequest.scope,
        dataType: conceptRequest.conceptDataType,
        widget: conceptRequest.widget,
        values: conceptRequest.value
      };
    } else if (conceptRequest.conceptDataType === "Numeric") {
      return {
        uuid: conceptRequest.conceptUUID,
        minValue: conceptRequest.minValue,
        maxValue: conceptRequest.maxValue,
        searchScope: conceptRequest.scope,
        dataType: conceptRequest.conceptDataType,
        widget: conceptRequest.widget
      };
    }
  });

  const searchResult = () => {
    const searchRequest = {
      subjectType: selectedSubjectType,
      name: enterValue.name,
      age: {
        minValue: enterValue.age,
        maxValue: null
      },
      includeVoided: includeVoied,
      addressIds: selectedAddressSort,
      concept: conceptRequests,
      gender: selectedGenderSort,
      registrationDate: {
        minValue: selectedDate.RegistrationDate.minValue,
        maxValue: selectedDate.RegistrationDate.maxValue
      },
      encounterDate: {
        minValue: selectedDate.EncounterDate.minValue,
        maxValue: selectedDate.EncounterDate.maxValue
      },
      programEncounterDate: {
        minValue: selectedDate.ProgramEncounterDate.minValue,
        maxValue: selectedDate.ProgramEncounterDate.maxValue
      },
      programEnrolmentDate: {
        minValue: selectedDate.EnrolmentDate.minValue,
        maxValue: selectedDate.EnrolmentDate.maxValue
      },
      searchAll: enterValue.searchAll
    };

    store.dispatch({ type: types.ADD_SEARCH_REQUEST, value: searchRequest });
  };

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
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <NonCodedConceptForm
                    searchFilterForms={selectedSearchFilter}
                    onChange={searchFilterConcept}
                    selectedConcepts={selectedConcepts}
                  />
                </Grid>
                <Grid item xs={12}>
                  <NonConceptForm
                    searchFilterForms={selectedSearchFilter}
                    selectedDate={selectedDate}
                    onDateChange={searchFilterDates}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CodedConceptForm
                    searchFilterForms={selectedSearchFilter}
                    conceptList={organisationConfigs.conceptList}
                    onChange={searchFilterConcept}
                    selectedConcepts={selectedConcepts}
                  />
                </Grid>
                <Grid item xs={12}>
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
              onClick={() => searchResult()}
              component={Link}
              to="/app/search"
            >
              Search
            </Button>
            <Button variant="contained" component={Link} to="/app/">
              Cancel
            </Button>
          </div>
        </FormControl>
      </Paper>
    </Fragment>
  );
}
