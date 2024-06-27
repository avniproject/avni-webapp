import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FormControl } from "@material-ui/core";
import Select from "react-select";
import { deburr, filter, find, get, head, identity, includes, isEmpty, isNil, map, pickBy, reject, startCase, values } from "lodash";
import Box from "@material-ui/core/Box";
import http from "common/utils/httpClient";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import { Title } from "react-admin";
import AsyncSelect from "react-select/async";
import { Concept, CustomFilter } from "avni-models";
import { useTranslation } from "react-i18next";
import { SaveComponent } from "../../common/components/SaveComponent";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { AvniTextField } from "../../common/components/AvniTextField";
import ErrorMessageUtil from "../../common/utils/ErrorMessageUtil";

const nonSupportedTypes = ["Duration", "Image", "Video", "Subject", "Location", "PhoneNumber", "GroupAffiliation", "Audio", "File"];
export const CreateEditFilters = ({
  omitTableData,
  selectedFilter,
  title,
  filterType,
  worklistUpdationRule,
  operationalModules,
  settings,
  documentationFileName,
  dashboardFilterSave
}) => {
  const { t } = useTranslation();
  const allTypes = values(CustomFilter.type);
  const filterTypes =
    filterType === "myDashboardFilters"
      ? reject(allTypes, t => [CustomFilter.type.Name, CustomFilter.type.Age, CustomFilter.type.SearchAll].includes(t))
      : allTypes;
  const typeOptions = filterTypes.map(t => ({ label: startCase(t), value: t }));

  const scopeOptions = values(CustomFilter.scope).map(s => ({ label: startCase(s), value: s }));
  const widgetOptions = values(CustomFilter.widget)
    .filter(w => w !== CustomFilter.widget.Relative)
    .map(t => ({ label: t, value: t }));

  const emptyFilter = {
    titleKey: "",
    subjectTypeUUID: "",
    type: "",
    scope: "",
    conceptName: "",
    conceptUUID: "",
    widget: "",
    scopeParameters: {},
    groupSubjectTypeUUID: ""
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
    conceptDataType,
    groupSubjectTypeUUID
  } = selectedFilter || emptyFilter;
  const { programs, subjectTypes, encounterTypes } = operationalModules || {};

  const mapToOptions = entity => map(entity, ({ name, uuid }) => ({ label: name, value: uuid }));

  const programOptions = mapToOptions(programs);
  const encounterTypeOptions = mapToOptions(encounterTypes);
  const subjectTypeOptions = mapToOptions(subjectTypes);

  const mapPreviousParamsToOptions = (scopeKey, options) => {
    return (scopeParameters && scopeParameters[scopeKey] && options.filter(({ value }) => scopeParameters[scopeKey].includes(value))) || [];
  };

  const mapPreviousToOptions = (prevValue, options) => {
    return (!isEmpty(prevValue) && head(options.filter(({ value }) => prevValue === value))) || "";
  };

  const [filterName, setFilterName] = useState(titleKey);
  const [selectedSubject, setSubject] = useState(mapPreviousToOptions(subjectTypeUUID, subjectTypeOptions));
  const groupSubjectTypeOptions = mapToOptions(
    filter(subjectTypes, ({ group }) => !!group && !get(find(subjectTypes, ({ uuid }) => uuid === selectedSubject.value), "group"))
  );
  const [selectedGroupSubject, setGroupSubjectType] = useState(mapPreviousToOptions(groupSubjectTypeUUID, subjectTypeOptions));
  const [selectedType, setType] = useState(mapPreviousToOptions(type, typeOptions));
  const [selectedConcept, setConcept] = React.useState(
    (conceptName && {
      label: conceptName,
      value: { uuid: conceptUUID, dataType: conceptDataType }
    }) ||
      ""
  );
  const [selectedScope, setScope] = useState(mapPreviousToOptions(scope, scopeOptions));
  const [selectedEncounter, setEncounter] = useState(mapPreviousParamsToOptions("encounterTypeUUIDs", encounterTypeOptions));
  const [selectedProgram, setProgram] = useState(mapPreviousParamsToOptions("programUUIDs", programOptions));
  const [selectedWidget, setWidget] = useState(mapPreviousToOptions(widget, widgetOptions));
  const [messageStatus, setMessageStatus] = useState({ message: "", display: false });
  const [snackBarStatus, setSnackBarStatus] = useState(true);

  const saveDisabled = () => {
    if (selectedType.value === CustomFilter.type.Concept) {
      const allRequiredStatus = isEmpty(filterName) || isEmpty(selectedScope) || isEmpty(selectedConcept) || isEmpty(selectedSubject);
      switch (selectedScope.value) {
        case CustomFilter.scope.Registration:
          return allRequiredStatus;
        case CustomFilter.scope.ProgramEnrolment:
          return allRequiredStatus || isEmpty(selectedProgram);
        case CustomFilter.scope.ProgramEncounter:
          return allRequiredStatus || isEmpty(selectedProgram) || isEmpty(selectedEncounter);
        case CustomFilter.scope.Encounter:
          return allRequiredStatus || isEmpty(selectedEncounter);
        default:
          return true;
      }
    } else {
      return (
        isEmpty(filterName) ||
        isEmpty(selectedSubject) ||
        isEmpty(selectedType) ||
        (selectedType.value === CustomFilter.type.GroupSubject && isEmpty(selectedGroupSubject))
      );
    }
  };

  const saveFilter = () => {
    const encType = isEmpty(selectedEncounter) ? [] : selectedEncounter.map(l => l.value);
    const prog = isEmpty(selectedProgram) ? [] : selectedProgram.map(l => l.value);
    const scopeParams = {
      programUUIDs: prog,
      encounterTypeUUIDs: encType
    };
    const newFilter = {
      titleKey: filterName,
      subjectTypeUUID: selectedSubject.value,
      groupSubjectTypeUUID: selectedGroupSubject.value,
      type: selectedType.value,
      scope: (!isEmpty(selectedScope) && selectedScope.value) || null,
      conceptName: (!isEmpty(selectedConcept) && selectedConcept.label) || null,
      conceptUUID: (!isEmpty(selectedConcept) && selectedConcept.value.uuid) || null,
      conceptDataType: (!isEmpty(selectedConcept) && selectedConcept.value.dataType) || null,
      widget: (!isEmpty(selectedWidget) && selectedWidget.label) || null,
      scopeParameters: !isEmpty(selectedConcept) ? scopeParams : null
    };

    if (!isNil(dashboardFilterSave)) {
      dashboardFilterSave(newFilter);
    } else {
      const data = getNewFilterData(pickBy(newFilter, identity));
      return http
        .put("/organisationConfig", data)
        .then(response => {
          if (response.status === 200 || response.status === 201) {
            setMessageStatus({ message: "TaskAssignmentFilter updated", display: true });
            setSnackBarStatus(true);
          }
        })
        .catch(error => {
          setMessageStatus(ErrorMessageUtil.getMessageType1(error));
          setSnackBarStatus(true);
        });
    }
  };

  const getNewFilterData = newFilter => {
    const setting = settings;
    const oldFilters = setting.settings[filterType];
    const newFilters = isNil(selectedFilter) ? [...oldFilters, newFilter] : [...oldFilters.filter(f => f.titleKey !== titleKey), newFilter];
    return {
      uuid: setting.uuid,
      worklistUpdationRule: worklistUpdationRule,
      settings: {
        languages: setting.settings.languages,
        myDashboardFilters:
          filterType === "myDashboardFilters" ? omitTableData(newFilters) : omitTableData(setting.settings.myDashboardFilters),
        searchFilters: filterType === "searchFilters" ? omitTableData(newFilters) : omitTableData(setting.settings.searchFilters)
      }
    };
  };

  const renderSelect = (name, placeholder, value, options, onChange, toolTipKey) => {
    return (
      <div style={{ width: 400 }}>
        <AvniFormLabel label={name} toolTipKey={toolTipKey} position={"top"} />
        <Select placeholder={placeholder} value={value} options={options} onChange={onChange} />
      </div>
    );
  };

  const renderMultiSelect = (name, placeholder, value, options, onChange, toolTipKey) => {
    return (
      <div style={{ width: 400 }}>
        <AvniFormLabel label={name} toolTipKey={toolTipKey} position={"top"} />
        <Select isMulti placeholder={placeholder} value={value} options={options} onChange={onChange} />
      </div>
    );
  };

  const [suggestions, setSuggestions] = React.useState([]);
  const loadConcept = (value, callback) => {
    if (!value) {
      callback([]);
    }
    const inputValue = deburr(value.trim()).toLowerCase();
    http.get("/search/concept?name=" + encodeURIComponent(inputValue)).then(response => {
      const concepts = response.data;
      const filteredConcepts = concepts.filter(concept => !includes(nonSupportedTypes, concept.dataType));
      const conceptOptions = map(filteredConcepts, ({ name, uuid, dataType }) => ({
        label: name,
        value: { uuid, dataType }
      }));
      setSuggestions(conceptOptions);
      callback(conceptOptions);
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
    const { RegistrationDate, EnrolmentDate, ProgramEncounterDate, EncounterDate } = CustomFilter.type;
    const widgetConceptDataTypes = [Concept.dataType.Date, Concept.dataType.DateTime, Concept.dataType.Time, Concept.dataType.Numeric];
    return (
      [RegistrationDate, EnrolmentDate, ProgramEncounterDate, EncounterDate].includes(selectedType.value) ||
      (selectedConcept.value && widgetConceptDataTypes.includes(selectedConcept.value.dataType))
    );
  };

  return (
    <div>
      <Title title="TaskAssignmentFilter Config" />
      <Box boxShadow={2} p={1} bgcolor="background.paper">
        <DocumentationContainer filename={documentationFileName}>
          <Box>
            <div className="container" style={{ float: "left", marginBottom: 10 }}>
              {title && <div style={{ fontSize: 20, color: "rgba(0, 0, 0)", marginBottom: 20 }}>{title}</div>}
              <FormControl fullWidth>
                <AvniTextField
                  id="Filter Name"
                  label="TaskAssignmentFilter Name *"
                  autoComplete="off"
                  value={filterName}
                  onChange={event => setFilterName(event.target.value)}
                  style={{ width: 400 }}
                  toolTipKey={"APP_DESIGNER_FILTER_NAME"}
                />
              </FormControl>
              <Box m={1} />
              {renderSelect(
                "Subject Type",
                "Select Subject Type",
                selectedSubject,
                subjectTypeOptions,
                sub => setSubject(sub),
                "APP_DESIGNER_FILTER_SUBJECT_TYPE"
              )}
              <Box m={1} />
              {renderSelect("Type", "Filter Type", selectedType, typeOptions, type => onTypeChange(type), "APP_DESIGNER_FILTER_TYPE")}
              <Box m={1} />
              {selectedType.value === CustomFilter.type.GroupSubject &&
                renderSelect(
                  "Group Subject Type",
                  "Select Group Subject Type",
                  selectedGroupSubject,
                  groupSubjectTypeOptions,
                  sub => setGroupSubjectType(sub),
                  "APP_DESIGNER_FILTER_GROUP_SUBJECT_TYPE"
                )}
              <Box m={1} />
              {selectedType.value === "Concept" && (
                <div style={{ width: 400 }}>
                  <AvniFormLabel label={"Select Concept"} toolTipKey={"APP_DESIGNER_FILTER_CONCEPT_SEARCH"} position={"top"} />
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={suggestions}
                    value={selectedConcept}
                    placeholder={"Type to search"}
                    onChange={value => setConcept(value)}
                    loadOptions={loadConcept}
                  />
                </div>
              )}
              <Box m={1} />
              {selectedType.value === "Concept" &&
                renderSelect(
                  "Scope",
                  "Search Scope",
                  selectedScope,
                  scopeOptions,
                  scope => onScopeChange(scope),
                  "APP_DESIGNER_FILTER_SEARCH_SCOPE"
                )}
              <Box m={1} />
              {selectedType.value === "Concept" &&
                selectedScope.value === CustomFilter.scope.ProgramEnrolment &&
                renderMultiSelect(
                  "Program",
                  "Select Program",
                  selectedProgram,
                  programOptions,
                  program => setProgram(program),
                  "APP_DESIGNER_FILTER_PROGRAM"
                )}
              <Box m={1} />
              {selectedType.value === "Concept" &&
                selectedScope.value === CustomFilter.scope.ProgramEncounter &&
                renderSelect(
                  "Program",
                  "Select Program",
                  selectedProgram,
                  programOptions,
                  program => setProgram([program]),
                  "APP_DESIGNER_FILTER_PROGRAM"
                )}
              <Box m={1} />
              {selectedType.value === "Concept" &&
                (selectedScope.value === CustomFilter.scope.ProgramEncounter || selectedScope.value === CustomFilter.scope.Encounter) &&
                renderMultiSelect(
                  "Encounter Type",
                  "Select Encounter Type",
                  selectedEncounter,
                  encounterTypeOptions,
                  enc => setEncounter(enc),
                  "APP_DESIGNER_FILTER_ENCOUNTER_TYPE"
                )}
              <Box m={1} />
              {widgetRequired() &&
                renderSelect(
                  "Widget Type",
                  "Select Widget Type",
                  selectedWidget,
                  widgetOptions,
                  w => setWidget(w),
                  "APP_DESIGNER_FILTER_WIDGET_TYPE"
                )}
              <Box m={1} />
            </div>
            <Box m={1}>
              <SaveComponent name={t("save")} onSubmit={saveFilter} disabledFlag={saveDisabled()} />
            </Box>
            <p />
          </Box>
        </DocumentationContainer>
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
