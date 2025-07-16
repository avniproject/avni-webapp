/*  SearchFilterFormWithLogs.js  */

import React, { Fragment, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { LineBreak, withParams } from "../../../common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { Paper, Typography, FormControl, Button, Grid as MuiGrid, Stack } from "@mui/material";
import { getGenders, getOrganisationConfig } from "../../reducers/metadataReducer";
import BasicForm from "../GlobalSearch/BasicForm";
import NonCodedConceptForm from "../GlobalSearch/NonCodedConceptForm";
import NonConceptForm from "../GlobalSearch/NonConceptForm";
import CodedConceptForm from "../GlobalSearch/CodedConceptForm";
import CheckBoxSearchComponent from "./CheckBoxSearchComponent";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import { format, isValid } from "date-fns";
import { store } from "../../../common/store";
import { types } from "../../reducers/searchFilterReducer";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import SubjectTypeOptions from "./SubjectTypeOptions";

/* ------------------------------------------------------------ */
/* Debug helpers                                                */
/* ------------------------------------------------------------ */
const DEBUG = process.env.NODE_ENV !== "production";
const log = DEBUG ? console.log.bind(console) : () => {};

const Grid = React.forwardRef(function GridDebugger(props, ref) {
  if (DEBUG) {
    const { children, ...rest } = props;
    log("Grid props keys →", Object.keys(rest));
  }
  return <MuiGrid ref={ref} {...props} />;
});

/* ------------------------------------------------------------ */
/* Styled components                                            */
/* ------------------------------------------------------------ */
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const StyledTypography = styled(Typography)({ fontSize: 20 });

const StyledButtons = styled("div")(({ theme }) => ({
  "& > *": { margin: theme.spacing(1) }
}));

/* ------------------------------------------------------------ */
/* Constants                                                    */
/* ------------------------------------------------------------ */
const initialStates = {
  nameAgeSearchAll: { name: "", age: "", searchAll: "" },
  entityDate: {
    RegistrationDate: { minValue: null, maxValue: null },
    EnrolmentDate: { minValue: null, maxValue: null },
    ProgramEncounterDate: { minValue: null, maxValue: null },
    EncounterDate: { minValue: null, maxValue: null }
  }
};

/* ------------------------------------------------------------ */
/* Pure SearchForm (original API, plus logs)                    */
/* ------------------------------------------------------------ */
export const SearchForm = ({ operationalModules, genders, organisationConfigs, searchRequest, searchTo, cancelTo, onSearch }) => {
  const { t } = useTranslation();

  /* ------------- initial props / log ------------- */
  useEffect(() => {
    log("SearchForm props →", {
      operationalModules,
      genders,
      organisationConfigs,
      searchRequest,
      searchTo,
      cancelTo
    });
  }, [operationalModules, genders, organisationConfigs, searchRequest, searchTo, cancelTo]);

  /* ------------- props & state ------------- */
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

  /* subject‑type */
  const [selectedSubjectTypeUUID, setSelectedSubjectTypeUUID] = useState(subjectType || _.get(operationalModules.subjectTypes[0], "uuid"));

  const initialSubjectTypeSearchFilter = organisationConfigs?.organisationConfig?.searchFilters?.filter(
    sf => sf.subjectTypeUUID === selectedSubjectTypeUUID
  );
  const [selectedSearchFilter, setSelectedSearchFilter] = useState(initialSubjectTypeSearchFilter || []);

  /* name / age / free‑text */
  const [enterValue, setEnterValue] = useState({
    name: name || "",
    age: (age && age.minValue) || "",
    searchAll: searchAll || ""
  });
  const searchFilterValue = e => setEnterValue({ ...enterValue, [e.target.name]: e.target.value });

  /* gender checkbox list */
  let g = {};
  _.forEach(gender, x => _.assign(g, { [x]: true }));
  const [selectedGender, setSelectedGender] = useState(g);
  const onGenderChange = e =>
    setSelectedGender({
      ...selectedGender,
      [e.target.name]: e.target.checked
    });
  const selectedGenderSort = Object.keys(selectedGender)
    .filter(k => selectedGender[k])
    .map(String);

  /* address */
  const [addressLevelIds, setAddressLevelIds] = useState(addressIds || []);

  /* date filters */
  const setPrev = d => ({
    minValue: d?.minValue || null,
    maxValue: d?.maxValue || null
  });
  const [selectedDate, setSelectedDate] = useState({
    RegistrationDate: setPrev(registrationDate),
    EnrolmentDate: setPrev(programEnrolmentDate),
    ProgramEncounterDate: setPrev(programEncounterDate),
    EncounterDate: setPrev(encounterDate)
  });
  const searchFilterDates = (min, max, type) =>
    setSelectedDate({
      ...selectedDate,
      [type]: {
        minValue: min && isValid(new Date(min)) ? format(new Date(min), "yyyy-MM-dd") : null,
        maxValue: max && isValid(new Date(max)) ? format(new Date(max), "yyyy-MM-dd") : null
      }
    });

  /* concept list */
  const getInitialConceptList = filters =>
    filters
      .filter(f => f.type === "Concept" && f.conceptDataType !== null)
      .map(c => {
        const def = {
          Date: { ...c, minValue: null, maxValue: null },
          DateTime: { ...c, minValue: null, maxValue: null },
          Time: { ...c, minValue: null, maxValue: null },
          Numeric: { ...c, minValue: null, maxValue: null },
          Coded: { ...c, values: [] },
          Text: { ...c, value: "" },
          Id: { ...c, value: "" }
        };
        return def[c.conceptDataType];
      });

  const initialConceptList = getInitialConceptList(selectedSearchFilter);
  const allConceptRelated = _.map(initialConceptList, itm => _.merge(itm, _.find(concept, { uuid: itm.conceptUUID })));
  const [selectedConcepts, setSelectedConcept] = useState(allConceptRelated);

  /* include‑voided / display‑count */
  const [checked, setChecked] = useState({
    includeVoided: searchRequest.includeVoided || false,
    includeDisplayCount: searchRequest.includeDisplayCount || false
  });
  const onChecked = (key, val) => setChecked(c => ({ ...c, [key]: val }));
  const { includeVoided, includeDisplayCount } = checked;

  /* ---------- helpers identical to original ---------- */
  const getSelectedConceptApi = list =>
    list.filter(c => {
      switch (c.conceptDataType) {
        case null:
          return false;
        case "Date":
        case "DateTime":
        case "Time":
          return c.widget === "Range" ? c.minValue && c.maxValue : c.minValue;
        case "Coded":
          return c.values.length > 0;
        case "Text":
        case "Id":
          return c.value;
        case "Numeric":
          return c.widget === "Range" ? c.minValue && c.maxValue : c.minValue;
        default:
          return false;
      }
    });

  const getConceptRequests = list =>
    getSelectedConceptApi(list).map(r => {
      if (["Date", "DateTime", "Time"].includes(r.conceptDataType)) {
        return {
          uuid: r.conceptUUID,
          minValue: r.minValue && isValid(new Date(r.minValue)) ? format(new Date(r.minValue), "yyyy-MM-dd") : null,
          maxValue: r.maxValue && isValid(new Date(r.maxValue)) ? format(new Date(r.maxValue), "yyyy-MM-dd") : null,
          searchScope: r.scope,
          dataType: r.conceptDataType,
          widget: r.widget
        };
      }
      if (r.conceptDataType === "Coded") {
        return {
          uuid: r.conceptUUID,
          searchScope: r.scope,
          dataType: r.conceptDataType,
          widget: r.widget,
          values: r.values
        };
      }
      if (["Text", "Id"].includes(r.conceptDataType)) {
        return {
          uuid: r.conceptUUID,
          searchScope: r.scope,
          dataType: r.conceptDataType,
          widget: r.widget,
          value: r.value
        };
      }
      if (r.conceptDataType === "Numeric") {
        return {
          uuid: r.conceptUUID,
          minValue: r.minValue,
          maxValue: r.maxValue,
          searchScope: r.scope,
          dataType: r.conceptDataType,
          widget: r.widget
        };
      }
      return null;
    });

  const conceptRequests = getConceptRequests(selectedConcepts);

  /* reset helper */
  const resetFilters = () => {
    setEnterValue(initialStates.nameAgeSearchAll);
    setSelectedGender({});
    setAddressLevelIds([]);
    setSelectedDate(initialStates.entityDate);
    setSelectedConcept(initialConceptList);
    setChecked({ includeVoided: false, includeDisplayCount: false });
  };

  /* subject‑type change */
  const onSubjectTypeChange = uuid => {
    setSelectedSubjectTypeUUID(uuid);
    const sf = organisationConfigs?.organisationConfig?.searchFilters?.filter(s => s.subjectTypeUUID === uuid);
    setSelectedSearchFilter(sf || []);
    resetFilters();
  };

  /* final search dispatch */
  const searchResult = () => {
    const req = {
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

    if (_.isFunction(onSearch)) onSearch(req);
    else store.dispatch({ type: types.ADD_SEARCH_REQUEST, value: req });
  };

  /* -------------------------------------------------- */
  /* render                                             */
  /* -------------------------------------------------- */
  return (
    <FormControl component="fieldset">
      <SubjectTypeOptions
        operationalModules={operationalModules}
        onSubjectTypeChange={onSubjectTypeChange}
        selectedSubjectTypeUUID={selectedSubjectTypeUUID}
        t={t}
      />

      {selectedSearchFilter && (
        <Stack>
          <Grid item xs={12}>
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

          <Grid item xs={12}>
            <NonCodedConceptForm
              searchFilterForms={selectedSearchFilter}
              onChange={(e, f, k) => searchFilterConcept(e, f, k, setSelectedConcept)}
              selectedConcepts={selectedConcepts}
            />
          </Grid>

          <Grid item xs={12}>
            <NonConceptForm searchFilterForms={selectedSearchFilter} selectedDate={selectedDate} onDateChange={searchFilterDates} />
          </Grid>

          <Grid item xs={12}>
            <CodedConceptForm
              searchFilterForms={selectedSearchFilter}
              conceptList={organisationConfigs.conceptList}
              onChange={(e, f, k) => searchFilterConcept(e, f, k, setSelectedConcept)}
              selectedConcepts={selectedConcepts}
            />
          </Grid>

          <Grid container spacing={3} direction="row">
            <Grid item>
              <CheckBoxSearchComponent
                label="Include Voided"
                checked={includeVoided}
                onChange={e => onChecked("includeVoided", e.target.checked)}
              />
            </Grid>
            <Grid item>
              <CheckBoxSearchComponent
                label="Display Count"
                checked={includeDisplayCount}
                onChange={e => onChecked("includeDisplayCount", e.target.checked)}
              />
            </Grid>
          </Grid>
        </Stack>
      )}

      <StyledButtons>
        <Button sx={{ mr: 1 }} variant="contained" color="primary" onClick={searchResult} {...searchProps}>
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

/* ------------------------------------------------------------ */
/* SearchFilterForm – wrapper with Breadcrumbs                  */
/* ------------------------------------------------------------ */
export const SearchFilterForm = ({ match, operationalModules, genders, organisationConfigs, searchRequest }) => {
  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <StyledPaper>
        <StyledTypography component="span">{useTranslation().t("search")}</StyledTypography>
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
};

/* ------------------------------------------------------------ */
/* Container (HOC wrapped)                                      */
/* ------------------------------------------------------------ */
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
    if (!organisationConfigs) getOrganisationConfig();
    getGenders();
  }, []);

  if (!(operationalModules && genders && organisationConfigs)) {
    return <CustomizedBackdrop load={false} />;
  }

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

const mapStateToProps = state => ({
  operationalModules: state.dataEntry.metadata.operationalModules,
  genders: state.dataEntry.metadata.genders,
  organisationConfigs: state.dataEntry.metadata.organisationConfigs,
  searchRequest: state.dataEntry.searchFilterReducer.request
});
const mapDispatchToProps = { getGenders, getOrganisationConfig };

const WrappedContainer = withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SearchFilterFormContainer)
  )
);

/* ------------------------------------------------------------ */
/* Exports                                                      */
/* ------------------------------------------------------------ */
export default WrappedContainer; // unchanged default
export { WrappedContainer as SearchFilterFormContainerLogged }; // if needed
