import { Fragment, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { LineBreak } from "../../../common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  Paper,
  Typography,
  FormControl,
  Button,
  Grid,
  Stack
} from "@mui/material";
import {
  getGenders,
  getOrganisationConfig
} from "../../reducers/metadataReducer";
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const StyledTypography = styled(Typography)({ fontSize: 20 });

const StyledButtons = styled("div")(({ theme }) => ({
  "& > *": { margin: theme.spacing(1) }
}));

const initialStates = {
  nameAgeSearchAll: { name: "", age: "", searchAll: "" },
  entityDate: {
    RegistrationDate: { minValue: null, maxValue: null },
    EnrolmentDate: { minValue: null, maxValue: null },
    ProgramEncounterDate: { minValue: null, maxValue: null },
    EncounterDate: { minValue: null, maxValue: null }
  }
};

export const SearchForm = ({
  operationalModules,
  genders,
  organisationConfigs,
  searchRequest,
  searchTo,
  cancelTo,
  onSearch
}) => {
  const { t } = useTranslation();
  const searchProps = _.isFunction(onSearch)
    ? {}
    : { to: searchTo, component: Link };

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

  const [selectedSubjectTypeUUID, setSelectedSubjectTypeUUID] = useState(
    subjectType || _.get(operationalModules.subjectTypes[0], "uuid")
  );

  const initialSubjectTypeSearchFilter = organisationConfigs?.organisationConfig?.searchFilters?.filter(
    sf => sf.subjectTypeUUID === selectedSubjectTypeUUID
  );
  const [selectedSearchFilter, setSelectedSearchFilter] = useState(
    initialSubjectTypeSearchFilter || []
  );

  const [enterValue, setEnterValue] = useState({
    name: name || "",
    age: (age && age.minValue) || "",
    searchAll: searchAll || ""
  });
  const searchFilterValue = e =>
    setEnterValue({ ...enterValue, [e.target.name]: e.target.value });

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

  const [addressLevelIds, setAddressLevelIds] = useState(addressIds || []);

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
        minValue:
          min && isValid(new Date(min))
            ? format(new Date(min), "yyyy-MM-dd")
            : null,
        maxValue:
          max && isValid(new Date(max))
            ? format(new Date(max), "yyyy-MM-dd")
            : null
      }
    });

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

  const [selectedConcepts, setSelectedConcept] = useState([]);

  // Update selected concepts when search filter changes
  useEffect(() => {
    const initialConceptList = getInitialConceptList(selectedSearchFilter);
    const allConceptRelated = _.map(initialConceptList, itm =>
      _.merge(itm, _.find(concept, { uuid: itm.conceptUUID }))
    );
    setSelectedConcept(allConceptRelated);
  }, [selectedSearchFilter, concept]);

  const [checked, setChecked] = useState({
    includeVoided: searchRequest.includeVoided || false,
    includeDisplayCount: searchRequest.includeDisplayCount || false
  });
  const onChecked = (key, val) => setChecked(c => ({ ...c, [key]: val }));
  const { includeVoided, includeDisplayCount } = checked;

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
          minValue:
            r.minValue && isValid(new Date(r.minValue))
              ? format(new Date(r.minValue), "yyyy-MM-dd")
              : null,
          maxValue:
            r.maxValue && isValid(new Date(r.maxValue))
              ? format(new Date(r.maxValue), "yyyy-MM-dd")
              : null,
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

  const resetFilters = () => {
    setEnterValue(initialStates.nameAgeSearchAll);
    setSelectedGender({});
    setAddressLevelIds([]);
    setSelectedDate(initialStates.entityDate);
    setChecked({ includeVoided: false, includeDisplayCount: false });
  };

  const onSubjectTypeChange = uuid => {
    setSelectedSubjectTypeUUID(uuid);
    const sf = organisationConfigs?.organisationConfig?.searchFilters?.filter(
      s => s.subjectTypeUUID === uuid
    );
    setSelectedSearchFilter(sf || []);
    resetFilters();
  };

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
          <Grid size={{ xs: 12 }}>
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

          <Grid size={{ xs: 12 }}>
            <NonCodedConceptForm
              searchFilterForms={selectedSearchFilter}
              onChange={(e, f, k) =>
                searchFilterConcept(e, f, k, setSelectedConcept)
              }
              selectedConcepts={selectedConcepts}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <NonConceptForm
              searchFilterForms={selectedSearchFilter}
              selectedDate={selectedDate}
              onDateChange={searchFilterDates}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CodedConceptForm
              searchFilterForms={selectedSearchFilter}
              conceptList={organisationConfigs.conceptList}
              onChange={(e, f, k) =>
                searchFilterConcept(e, f, k, setSelectedConcept)
              }
              selectedConcepts={selectedConcepts}
            />
          </Grid>

          <Grid container spacing={3} direction="row">
            <Grid>
              <CheckBoxSearchComponent
                label="Include Voided"
                checked={includeVoided}
                onChange={e => onChecked("includeVoided", e.target.checked)}
              />
            </Grid>
            <Grid>
              <CheckBoxSearchComponent
                label="Display Count"
                checked={includeDisplayCount}
                onChange={e =>
                  onChecked("includeDisplayCount", e.target.checked)
                }
              />
            </Grid>
          </Grid>
        </Stack>
      )}

      <StyledButtons>
        <Button
          sx={{ mr: 1 }}
          variant="contained"
          color="primary"
          onClick={searchResult}
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

const searchFilterConcept = function(
  event,
  searchFilterForm,
  fieldName,
  setSelectedConcept
) {
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
        } else if (["Text", "Id"].includes(concept.conceptDataType)) {
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
            const selectedNumeric = event.target.value;
            return {
              ...concept,
              [fieldName]: selectedNumeric
            };
          } else {
            return {
              ...concept
            };
          }
        }
      }
      return null;
    })
  );
};

export const SearchFilterForm = ({
  operationalModules,
  genders,
  organisationConfigs,
  searchRequest
}) => {
  const location = useLocation();

  return (
    <Fragment>
      <Breadcrumbs path={location.pathname} />
      <StyledPaper>
        <StyledTypography component="span">
          {useTranslation().t("search")}
        </StyledTypography>
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

function SearchFilterFormContainer() {
  const dispatch = useDispatch();
  const operationalModules = useSelector(
    state => state.dataEntry.metadata.operationalModules
  );
  const genders = useSelector(state => state.dataEntry.metadata.genders);
  const organisationConfigs = useSelector(
    state => state.dataEntry.metadata.organisationConfigs
  );
  const searchRequest = useSelector(
    state => state.dataEntry.searchFilterReducer.request
  );

  useEffect(() => {
    if (!organisationConfigs) dispatch(getOrganisationConfig());
    dispatch(getGenders());
  }, [dispatch, organisationConfigs]);

  if (!(operationalModules && genders && organisationConfigs)) {
    return <CustomizedBackdrop load={false} />;
  }

  return (
    <SearchFilterForm
      operationalModules={operationalModules}
      genders={genders}
      organisationConfigs={organisationConfigs}
      searchRequest={searchRequest}
    />
  );
}

export default SearchFilterFormContainer;
