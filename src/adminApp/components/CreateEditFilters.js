import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FormControl, Input, InputLabel } from "@material-ui/core";
import Select from "react-select";
import _, { deburr } from "lodash";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import http from "common/utils/httpClient";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import { Title } from "react-admin";
import AsyncSelect from "react-select/async";
import { CustomFilter, Concept } from "avni-models";

export const CreateEditFilters = props => {
  if (_.isNil(props.history.location.state)) {
    return <div />;
  }

  const { omitTableData, selectedFilter, title, filterType } = props.history.location.state;
  const allTypes = _.values(CustomFilter.type);
  const getFilterTypes =
    filterType === "myDashboardFilters"
      ? _.reject(allTypes, t =>
          [CustomFilter.type.Name, CustomFilter.type.Age, CustomFilter.type.SearchAll].includes(t)
        )
      : allTypes;
  const typeOptions = getFilterTypes.map(t => ({ label: _.startCase(t), value: t }));

  const scopeOptions = _.values(CustomFilter.scope).map(s => ({ label: _.startCase(s), value: s }));
  const widgetOptions = _.values(CustomFilter.widget).map(t => ({ label: t, value: t }));

  const emptyFilter = {
    titleKey: "",
    subjectTypeUUID: "",
    type: "",
    scope: "",
    conceptName: "",
    conceptUUID: "",
    widget: "",
    scopeParameters: {}
  };

  const {
    conceptName,
    conceptUUID,
    scope,
    titleKey,
    scopeParameters,
    subjectTypeUUID,
    widget,
    type,
    conceptDataType
  } = selectedFilter || emptyFilter;
  const { programs, subjectTypes, encounterTypes } =
    props.history.location.state.operationalModules || {};

  const mapToOptions = entity => _.map(entity, ({ name, uuid }) => ({ label: name, value: uuid }));

  const programOptions = mapToOptions(programs);
  const encounterTypeOptions = mapToOptions(encounterTypes);
  const subjectTypeOptions = mapToOptions(subjectTypes);

  const mapPreviousParamsToOptions = (scopeKey, options) => {
    return (
      (scopeParameters &&
        scopeParameters[scopeKey] &&
        options.filter(({ value }) => scopeParameters[scopeKey].includes(value))) ||
      []
    );
  };

  const mapPreviousToOptions = (prevValue, options) => {
    return (
      (!_.isEmpty(prevValue) && _.head(options.filter(({ value }) => prevValue === value))) || ""
    );
  };

  const [filterName, setFilterName] = useState(titleKey);
  const [selectedSubject, setSubject] = useState(
    mapPreviousToOptions(subjectTypeUUID, subjectTypeOptions)
  );
  const [selectedType, setType] = useState(mapPreviousToOptions(type, typeOptions));
  const [selectedConcept, setConcept] = React.useState(
    (conceptName && {
      label: conceptName,
      value: { uuid: conceptUUID, dataType: conceptDataType }
    }) ||
      ""
  );
  const [selectedScope, setScope] = useState(mapPreviousToOptions(scope, scopeOptions));
  const [selectedEncounter, setEncounter] = useState(
    mapPreviousParamsToOptions("encounterTypeUUIDs", encounterTypeOptions)
  );
  const [selectedProgram, setProgram] = useState(
    mapPreviousParamsToOptions("programUUIDs", programOptions)
  );
  const [selectedWidget, setWidget] = useState(mapPreviousToOptions(widget, widgetOptions));
  const [messageStatus, setMessageStatus] = useState({ message: "", display: false });
  const [snackBarStatus, setSnackBarStatus] = useState(true);

  const saveDisabled = () => {
    if (selectedType.value === CustomFilter.type.Concept) {
      const allRequiredStatus =
        _.isEmpty(filterName) ||
        _.isEmpty(selectedScope) ||
        _.isEmpty(selectedConcept) ||
        _.isEmpty(selectedSubject);
      switch (selectedScope.value) {
        case CustomFilter.scope.Registration:
          return allRequiredStatus;
        case CustomFilter.scope.ProgramEnrolment:
          return allRequiredStatus || _.isEmpty(selectedProgram);
        case CustomFilter.scope.ProgramEncounter:
          return allRequiredStatus || _.isEmpty(selectedProgram) || _.isEmpty(selectedEncounter);
        case CustomFilter.scope.Encounter:
          return allRequiredStatus || _.isEmpty(selectedEncounter);
        default:
          return true;
      }
    } else {
      return _.isEmpty(filterName) || _.isEmpty(selectedSubject) || _.isEmpty(selectedType);
    }
  };

  const saveFilter = () => {
    const encType = _.isEmpty(selectedEncounter) ? [] : selectedEncounter.map(l => l.value);
    const prog = _.isEmpty(selectedProgram) ? [] : selectedProgram.map(l => l.value);
    const scopeParams = {
      programUUIDs: prog,
      encounterTypeUUIDs: encType
    };
    const newFilter = {
      titleKey: filterName,
      subjectTypeUUID: selectedSubject.value,
      type: selectedType.value,
      scope: (!_.isEmpty(selectedScope) && selectedScope.value) || null,
      conceptName: (!_.isEmpty(selectedConcept) && selectedConcept.label) || null,
      conceptUUID: (!_.isEmpty(selectedConcept) && selectedConcept.value.uuid) || null,
      conceptDataType: (!_.isEmpty(selectedConcept) && selectedConcept.value.dataType) || null,
      widget: (!_.isEmpty(selectedWidget) && selectedWidget.label) || null,
      scopeParameters: !_.isEmpty(selectedConcept) ? scopeParams : null
    };
    const data = getNewFilterData(_.pickBy(newFilter, _.identity));

    http
      .post("/organisationConfig", data)
      .then(response => {
        if (response.status === 201) {
          setMessageStatus({ message: "Filter updated", display: true });
          setSnackBarStatus(true);
        }
      })
      .catch(error => {
        setMessageStatus({ message: "Something went wrong please try later", display: true });
        setSnackBarStatus(true);
      });
  };

  const getNewFilterData = newFilter => {
    const setting = props.history.location.state.settings;
    const filterType = props.history.location.state.filterType;
    const oldFilters = setting.settings[filterType];
    const newFilters = _.isNil(props.history.location.state.selectedFilter)
      ? [...oldFilters, newFilter]
      : [...oldFilters.filter(f => f.titleKey !== titleKey), newFilter];
    return {
      uuid: setting.uuid,
      settings: {
        languages: setting.settings.languages,
        myDashboardFilters:
          filterType === "myDashboardFilters"
            ? omitTableData(newFilters)
            : omitTableData(setting.settings.myDashboardFilters),
        searchFilters:
          filterType === "searchFilters"
            ? omitTableData(newFilters)
            : omitTableData(setting.settings.searchFilters)
      }
    };
  };

  const renderSelect = (name, placeholder, value, options, onChange) => {
    return (
      <Grid item sm={12}>
        <div>
          <div style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.54)" }}>{name}</div>
          <Select placeholder={placeholder} value={value} options={options} onChange={onChange} />
        </div>
      </Grid>
    );
  };

  const renderMultiSelect = (name, placeholder, value, options, onChange) => {
    return (
      <Grid item sm={12}>
        <div>
          <div style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.54)" }}>{name}</div>
          <Select
            isMulti
            placeholder={placeholder}
            value={value}
            options={options}
            onChange={onChange}
          />
        </div>
      </Grid>
    );
  };

  const [suggestions, setSuggestions] = React.useState([]);
  const loadConcept = (value, callback) => {
    if (!value) {
      return callback([]);
    }
    const inputValue = deburr(value.trim()).toLowerCase();
    http
      .get(`/search/concept?name=${inputValue}`)
      .then(response => {
        const concepts = response.data;
        const filteredConcepts = concepts.filter(
          concept => concept.dataType !== "NA" && concept.dataType !== "Duration"
        );
        const conceptOptions = _.map(filteredConcepts, ({ name, uuid, dataType }) => ({
          label: name,
          value: { uuid, dataType }
        }));
        setSuggestions(conceptOptions);
        callback(conceptOptions);
      })
      .catch(error => {
        console.log(error);
      });
  };
  const resetState = () => {
    setEncounter("");
    setProgram("");
    setWidget("");
  };

  const onTypeChange = type => {
    setType(type);
    setConcept("");
    setScope("");
    resetState();
  };

  const onScopeChange = scope => {
    setScope(scope);
    resetState();
  };

  const widgetRequired = () => {
    const {
      RegistrationDate,
      EnrolmentDate,
      ProgramEncounterDate,
      EncounterDate
    } = CustomFilter.type;
    const widgetConceptDataTypes = [
      Concept.dataType.Date,
      Concept.dataType.DateTime,
      Concept.dataType.Time,
      Concept.dataType.Numeric
    ];
    return (
      [RegistrationDate, EnrolmentDate, ProgramEncounterDate, EncounterDate].includes(
        selectedType.value
      ) ||
      (selectedConcept.value && widgetConceptDataTypes.includes(selectedConcept.value.dataType))
    );
  };

  return (
    <div>
      <Title title="Filter Config" />
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Box mr={80}>
          {!_.isEmpty(programs) && !_.isEmpty(encounterTypes) && (
            <Grid container justify="flex-start">
              <Grid item sm={12}>
                <div style={{ fontSize: 20, color: "rgba(0, 0, 0)" }}>{title}</div>
              </Grid>
              <Box mb={5} />
              <Grid item sm={12}>
                <FormControl fullWidth>
                  <InputLabel>Filter Name</InputLabel>
                  <Input
                    disableUnderline={false}
                    value={filterName}
                    onChange={event => setFilterName(event.target.value)}
                  />
                </FormControl>
              </Grid>
              <Box m={0.5} />
              {renderSelect(
                "Subject Type",
                "Select Subject Type",
                selectedSubject,
                subjectTypeOptions,
                sub => setSubject(sub)
              )}
              <Box m={0.5} />
              {renderSelect("Type", "Filter Type", selectedType, typeOptions, type =>
                onTypeChange(type)
              )}
              <Box m={0.5} />
              {selectedType.value === "Concept" && (
                <Grid item sm={12}>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.54)" }}>Select Concept</div>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions={suggestions}
                      value={selectedConcept}
                      placeholder={"Type to search"}
                      onChange={value => setConcept(value)}
                      loadOptions={loadConcept}
                    />
                  </div>
                </Grid>
              )}
              <Box m={0.5} />
              {selectedType.value === "Concept" &&
                renderSelect("Search Scope", "Scope", selectedScope, scopeOptions, scope =>
                  onScopeChange(scope)
                )}
              <Box m={0.5} />
              {selectedType.value === "Concept" &&
                selectedScope.value === CustomFilter.scope.ProgramEnrolment &&
                renderMultiSelect(
                  "Program",
                  "Select Program",
                  selectedProgram,
                  programOptions,
                  program => setProgram(program)
                )}
              <Box m={0.5} />
              {selectedType.value === "Concept" &&
                selectedScope.value === CustomFilter.scope.ProgramEncounter &&
                renderSelect(
                  "Program",
                  "Select Program",
                  selectedProgram,
                  programOptions,
                  program => setProgram([program])
                )}
              <Box m={0.5} />
              {selectedType.value === "Concept" &&
                (selectedScope.value === CustomFilter.scope.ProgramEncounter ||
                  selectedScope.value === CustomFilter.scope.Encounter) &&
                renderMultiSelect(
                  "Encounter Type",
                  "Select Encounter Type",
                  selectedEncounter,
                  encounterTypeOptions,
                  enc => setEncounter(enc)
                )}
              <Box m={0.5} />
              {widgetRequired() &&
                renderSelect(
                  "Widget Type",
                  "Select Widget Type",
                  selectedWidget,
                  widgetOptions,
                  w => setWidget(w)
                )}
              <Box mt={2} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  onClick={saveFilter}
                  color="primary"
                  aria-haspopup="false"
                  disabled={saveDisabled()}
                >
                  Save
                </Button>
              </Box>
              <p />
            </Grid>
          )}
        </Box>
        {messageStatus.display && (
          <CustomizedSnackbar
            message={messageStatus.message}
            getDefaultSnackbarStatus={status => setSnackBarStatus(status)}
            defaultSnackbarStatus={snackBarStatus}
          />
        )}
      </Box>
    </div>
  );
};
