import { Fragment, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { LineBreak, withParams } from "../../../common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { Paper, Typography, FormControl, Button, Grid } from "@mui/material";
import { getGenders, getOrganisationConfig } from "../../reducers/metadataReducer";
import BasicForm from "../GlobalSearch/BasicForm";
import NonCodedConceptForm from "../GlobalSearch/NonCodedConceptForm";
import NonConceptForm from "../GlobalSearch/NonConceptForm";
import CodedConceptForm from "../GlobalSearch/CodedConceptForm";
import CheckBoxSearchComponent from "./CheckBoxSearchComponent";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import moment from "moment/moment";
import { store } from "../../../common/store/createStore";
import { types } from "../../reducers/searchFilterReducer";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import SubjectTypeOptions from "./SubjectTypeOptions";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const StyledTypography = styled(Typography)({
  fontSize: "20px"
});

const StyledButtons = styled("div")(({ theme }) => ({
  "& > *": {
    margin: theme.spacing(1)
  }
}));

const StyledGrid = styled(Grid)({
  paddingLeft: 10
});

const initialStates = {
  nameAgeSearchAll: {
    name: "",
    age: "",
    searchAll: ""
  },
  entityDate: {
    RegistrationDate: { minValue: null, maxValue: null },
    EnrolmentDate: { minValue: null, maxValue: null },
    ProgramEncounterDate: { minValue: null, maxValue: null },
    EncounterDate: { minValue: null, maxValue: null }
  }
};

function SearchFilterFormContainer({
  match,
  operationalModules,
  getGenders,
  genders,
  getOrganisationConfig,
  organisationConfigs,
  searchRequest
}) {
  useEffect(() => {
    if (!organisationConfigs) {
      getOrganisationConfig();
    }
    getGenders();
  }, []);

  if (!(operationalModules && genders && organisationConfigs)) {
    return <CustomizedBackdrop load={false} />;
  } else {
    return (
      <SearchFilterForm
        match={match}
        operationalModules={operationalModules}
        genders={genders}
        organisationConfigs={organisationConfigs}
        searchRequest={searchRequest}
      />
    );
  }
}

const mapStateToProps = state => ({
  operationalModules: state.dataEntry.metadata.operationalModules,
  genders: state.dataEntry.metadata.genders,
  organisationConfigs: state.dataEntry.metadata.organisationConfigs,
  searchRequest: state.dataEntry.searchFilterReducer.request
});

const mapDispatchToProps = {
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

function SearchFilterForm({ match, operationalModules, genders, organisationConfigs, searchRequest }) {
  const { t } = useTranslation();
  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <StyledPaper>
        <StyledTypography component="span">{t("search")}</StyledTypography>
        <LineBreak num={1} />
        <SearchForm
          operationalModules={operationalModules}
          genders={genders}
          organisationConfigs={organisationConfigs}
          searchRequest={searchRequest}
          searchTo="/app/search"
          cancelTo="/app/"
        />
      </StyledPaper>
    </Fragment>
  );
}

const searchFilterConcept = function(event, searchFilterForm, fieldName, setSelectedConcept) {
  setSelectedConcept(previousSelectedConcepts =>
    previousSelectedConcepts.map(concept => {
      if (concept.conceptDataType === null) {
        return concept;
      }
      if (["Date", "DateTime", "Time"].includes(concept.conceptDataType)) {
        if (concept.conceptUUID === searchFilterForm.conceptUUID) {
          return { ...concept, [fieldName]: event };
        }
        return concept;
      }
      if (concept.conceptDataType === "Coded") {
        if (concept.conceptUUID === searchFilterForm.conceptUUID) {
          const selectedCodedValue = {};
          concept.values.forEach(element => {
            selectedCodedValue[element] = true;
          });
          selectedCodedValue[event.target.name] = event.target.checked;
          return {
            ...concept,
            values: Object.keys(selectedCodedValue).filter(selectedId => selectedCodedValue[selectedId])
          };
        }
        return concept;
      }
      if (["Text", "Id"].includes(concept.conceptDataType)) {
        if (concept.conceptUUID === searchFilterForm.conceptUUID) {
          return { ...concept, value: event.target.value };
        }
        return concept;
      }
      if (concept.conceptDataType === "Numeric") {
        if (concept.conceptUUID === searchFilterForm.conceptUUID) {
          return { ...concept, [fieldName]: event.target.value };
        }
        return concept;
      }
      return concept;
    })
  );
};

const searchResult = function(
  selectedSubjectTypeUUID,
  enterValue,
  includeVoided,
  includeDisplayCount,
  addressLevelIds,
  conceptRequests,
  selectedGenderSort,
  selectedDate,
  onSearch
) {
  const searchRequest = {
    subjectType: selectedSubjectTypeUUID,
    name: enterValue.name,
    age: { minValue: enterValue.age, maxValue: null },
    includeVoided,
    includeDisplayCount,
    addressIds: addressLevelIds,
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

  if (_.isFunction(onSearch)) {
    onSearch(searchRequest);
  } else {
    store.dispatch({ type: types.ADD_SEARCH_REQUEST, value: searchRequest });
  }
};

const getSelectedConceptApi = function(selectedConcepts) {
  return selectedConcepts.filter(selectedConcept => {
    if (selectedConcept.conceptDataType === null) {
      return false;
    }
    if (["Date", "DateTime", "Time"].includes(selectedConcept.conceptDataType)) {
      return selectedConcept.widget === "Range" ? selectedConcept.minValue && selectedConcept.maxValue : selectedConcept.minValue;
    }
    if (selectedConcept.conceptDataType === "Coded") {
      return selectedConcept.values.length > 0;
    }
    if (["Text", "Id"].includes(selectedConcept.conceptDataType)) {
      return selectedConcept.value;
    }
    if (selectedConcept.conceptDataType === "Numeric") {
      return selectedConcept.widget === "Range" ? selectedConcept.minValue && selectedConcept.maxValue : selectedConcept.minValue;
    }
    return false;
  });
};

const getConceptRequests = function(selectedConcepts) {
  return getSelectedConceptApi(selectedConcepts).map(conceptRequest => {
    if (["Date", "DateTime", "Time"].includes(conceptRequest.conceptDataType)) {
      return {
        uuid: conceptRequest.conceptUUID,
        minValue: conceptRequest.minValue !== null ? moment(conceptRequest.minValue).format("YYYY-MM-DD") : null,
        maxValue: conceptRequest.maxValue !== null ? moment(conceptRequest.maxValue).format("YYYY-MM-DD") : null,
        searchScope: conceptRequest.scope,
        dataType: conceptRequest.conceptDataType,
        widget: conceptRequest.widget
      };
    }
    if (conceptRequest.conceptDataType === "Coded") {
      return {
        uuid: conceptRequest.conceptUUID,
        searchScope: conceptRequest.scope,
        dataType: conceptRequest.conceptDataType,
        widget: conceptRequest.widget,
        values: conceptRequest.values
      };
    }
    if (["Text", "Id"].includes(conceptRequest.conceptDataType)) {
      return {
        uuid: conceptRequest.conceptUUID,
        searchScope: conceptRequest.scope,
        dataType: conceptRequest.conceptDataType,
        widget: conceptRequest.widget,
        value: conceptRequest.value
      };
    }
    if (conceptRequest.conceptDataType === "Numeric") {
      return {
        uuid: conceptRequest.conceptUUID,
        minValue: conceptRequest.minValue,
        maxValue: conceptRequest.maxValue,
        searchScope: conceptRequest.scope,
        dataType: conceptRequest.conceptDataType,
        widget: conceptRequest.widget
      };
    }
    return null;
  });
};

const getInitialConceptList = function(selectedSearchFilter) {
  const conceptList = selectedSearchFilter.filter(searchElement => searchElement.type === "Concept");

  return conceptList
    .filter(concept => concept.conceptDataType !== null)
    .map(concept => {
      const defaultState = {
        Date: { ...concept, minValue: null, maxValue: null },
        DateTime: { ...concept, minValue: null, maxValue: null },
        Time: { ...concept, minValue: null, maxValue: null },
        Numeric: { ...concept, minValue: null, maxValue: null },
        Coded: { ...concept, values: [] },
        Text: { ...concept, value: "" },
        Id: { ...concept, value: "" }
      };
      return defaultState[concept.conceptDataType];
    });
};

export const SearchForm = ({ operationalModules, genders, organisationConfigs, searchRequest, searchTo, cancelTo, onSearch }) => {
  const { t } = useTranslation();
  const searchProps = _.isFunction(onSearch) ? {} : { to: searchTo, component: Link };
  const {
    subjectType,
    name,
    age,
    addressIds,
    concept,
    gender,
    registrationDate,
    encounterDate,
    programEncounterDate,
    programEnrolmentDate,
    searchAll
  } = searchRequest;

  const [selectedSubjectTypeUUID, setSelectedSubjectTypeUUID] = useState(subjectType || _.get(operationalModules.subjectTypes[0], "uuid"));
  const initialSubjectTypeSearchFilter =
    organisationConfigs &&
    organisationConfigs.organisationConfig.searchFilters &&
    organisationConfigs.organisationConfig.searchFilters.filter(searchFilter => searchFilter.subjectTypeUUID === selectedSubjectTypeUUID);
  const [selectedSearchFilter, setSelectedSearchFilter] = useState(initialSubjectTypeSearchFilter || []);

  // name age search all
  const [enterValue, setEnterValue] = useState({
    name: name || "",
    age: (age && age.minValue) || "",
    searchAll: searchAll || ""
  });

  const searchFilterValue = event => {
    setEnterValue({
      ...enterValue,
      [event.target.name]: event.target.value
    });
  };

  let g = {};
  _.forEach(gender, gender => _.assign(g, { [gender]: true }));
  const [selectedGender, setSelectedGender] = useState(g);

  const onGenderChange = event => {
    setSelectedGender({ ...selectedGender, [event.target.name]: event.target.checked });
  };

  const selectedGenderSort =
    selectedGender != null
      ? Object.keys(selectedGender)
          .filter(selectedId => selectedGender[selectedId])
          .map(String)
      : [];

  const [addressLevelIds, setAddressLevelIds] = useState(addressIds || []);

  const setPreviousMinMaxValues = registrationDate => ({
    minValue: (registrationDate && registrationDate.minValue) || null,
    maxValue: (registrationDate && registrationDate.maxValue) || null
  });

  const [selectedDate, setSelectedDate] = useState({
    RegistrationDate: setPreviousMinMaxValues(registrationDate),
    EnrolmentDate: setPreviousMinMaxValues(programEnrolmentDate),
    ProgramEncounterDate: setPreviousMinMaxValues(programEncounterDate),
    EncounterDate: setPreviousMinMaxValues(encounterDate)
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

  const initialConceptList = getInitialConceptList(selectedSearchFilter);
  const allConceptRelatedFilters = _.map(initialConceptList, item => _.merge(item, _.find(concept, { uuid: item.conceptUUID })));
  const [selectedConcepts, setSelectedConcept] = useState(allConceptRelatedFilters);
  const [checked, setChecked] = useState({
    includeVoided: searchRequest.includeVoided || false,
    includeDisplayCount: searchRequest.includeDisplayCount || false
  });
  const { includeVoided, includeDisplayCount } = checked;

  const onChecked = (key, value) => {
    setChecked(currentChecked => ({ ...currentChecked, [key]: value }));
  };

  const conceptRequests = getConceptRequests(selectedConcepts);

  const resetFilters = () => {
    setEnterValue(initialStates.nameAgeSearchAll);
    setSelectedGender({});
    setAddressLevelIds([]);
    setSelectedDate(initialStates.entityDate);
    setSelectedConcept(initialConceptList);
    setChecked({ includeVoided: false, includeDisplayCount: false });
  };

  const onSubjectTypeChange = subjectTypeUUID => {
    setSelectedSubjectTypeUUID(subjectTypeUUID);
    const selectedSubjectTypeSearchFilter =
      organisationConfigs.organisationConfig.searchFilters &&
      organisationConfigs.organisationConfig.searchFilters.filter(searchFilter => searchFilter.subjectTypeUUID === subjectTypeUUID);
    setSelectedSearchFilter(selectedSubjectTypeSearchFilter || []);
    resetFilters();
  };

  return (
    <FormControl component="fieldset">
      <SubjectTypeOptions
        operationalModules={operationalModules}
        onSubjectTypeChange={onSubjectTypeChange}
        selectedSubjectTypeUUID={selectedSubjectTypeUUID}
        t={t}
      />
      {selectedSearchFilter ? (
        <StyledGrid container>
          <Grid size={12}>
            <BasicForm
              searchFilterForms={selectedSearchFilter}
              onChange={searchFilterValue}
              enterValue={enterValue}
              genders={genders}
              onGenderChange={onGenderChange}
              selectedGender={selectedGender}
              addressLevelIds={addressLevelIds}
              setAddressLevelIds={setAddressLevelIds}
            />
          </Grid>
          <Grid size={12}>
            <NonCodedConceptForm
              searchFilterForms={selectedSearchFilter}
              onChange={(event, searchFilterForm, fieldName) => searchFilterConcept(event, searchFilterForm, fieldName, setSelectedConcept)}
              selectedConcepts={selectedConcepts}
            />
          </Grid>
          <Grid size={12}>
            <NonConceptForm searchFilterForms={selectedSearchFilter} selectedDate={selectedDate} onDateChange={searchFilterDates} />
          </Grid>
          <Grid size={12}>
            <CodedConceptForm
              searchFilterForms={selectedSearchFilter}
              conceptList={organisationConfigs.conceptList}
              onChange={(event, searchFilterForm, fieldName) => searchFilterConcept(event, searchFilterForm, fieldName, setSelectedConcept)}
              selectedConcepts={selectedConcepts}
            />
          </Grid>
          <Grid container spacing={3} direction="row">
            <Grid>
              <CheckBoxSearchComponent
                label="Include Voided"
                checked={includeVoided}
                onChange={event => onChecked("includeVoided", event.target.checked)}
              />
            </Grid>
            <Grid>
              <CheckBoxSearchComponent
                label="Display Count"
                checked={includeDisplayCount}
                onChange={event => onChecked("includeDisplayCount", event.target.checked)}
              />
            </Grid>
          </Grid>
        </StyledGrid>
      ) : null}
      <StyledButtons>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            searchResult(
              selectedSubjectTypeUUID,
              enterValue,
              includeVoided,
              includeDisplayCount,
              addressLevelIds,
              conceptRequests,
              selectedGenderSort,
              selectedDate,
              onSearch
            )
          }
          {...searchProps}
        >
          {t("search")}
        </Button>
        {cancelTo && (
          <Button variant="contained" component={Link} to={cancelTo}>
            {t("cancel")}
          </Button>
        )}
      </StyledButtons>
    </FormControl>
  );
};
