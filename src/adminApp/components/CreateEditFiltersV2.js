import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FormControl } from "@material-ui/core";
import Select from "react-select";
import _, { map, startCase, values } from "lodash";
import Box from "@material-ui/core/Box";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import { Title } from "react-admin";
import AsyncSelect from "react-select/async";
import { CustomFilter, DashboardFilterConfig, MetaDataService } from "openchs-models";
import { useTranslation } from "react-i18next";
import { SaveComponent } from "../../common/components/SaveComponent";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { AvniTextField } from "../../common/components/AvniTextField";
import ConceptService from "../../common/service/ConceptService";

function MultipleEntitySelect({ name, placeholder, selectedEntities, options, onChange, toolTipKey }) {
  const selectedValues = _.intersectionWith(options, selectedEntities, (a, b) => {
    return a.value.uuid === b.uuid;
  });
  return (
    <div style={{ width: 400 }}>
      <AvniFormLabel label={name} toolTipKey={toolTipKey} position={"top"} />
      <Select isMulti placeholder={placeholder} value={selectedValues} options={options} onChange={onChange} maxMenuHeight={200} />
    </div>
  );
}

function SingleSelect({ name, placeholder, value, options, onChange, toolTipKey }) {
  const selectValue = _.find(options, x => x.value === value);
  return (
    <div style={{ width: 400 }}>
      <AvniFormLabel label={name} toolTipKey={toolTipKey} position={"top"} />
      <Select placeholder={placeholder} value={selectValue} options={options} onChange={onChange} maxMenuHeight={200} />
    </div>
  );
}

function SingleEntitySelect({ name, placeholder, selectedEntity, options, onChange, toolTipKey }) {
  const selectValue = _.find(options, x => x.value.uuid === _.get(selectedEntity, "uuid"));
  return (
    <div style={{ width: 400 }}>
      <AvniFormLabel label={name} toolTipKey={toolTipKey} position={"top"} />
      <Select placeholder={placeholder} value={selectValue} options={options} onChange={onChange} />
    </div>
  );
}

function mapToOptions(entities) {
  return map(entities, entity => ({ label: entity.name, value: entity }));
}

function isSaveDisabled(filterConfig, filterName) {
  return !filterConfig.isValid() || _.isEmpty(filterName);
}

export const CreateEditFiltersV2 = ({ selectedFilter, operationalModules, documentationFileName, dashboardFilterSave }) => {
  const isNew = _.isNil(_.get(selectedFilter, "uuid"));
  const { t } = useTranslation();
  const typeOptions = values(CustomFilter.getDashboardFilterTypes()).map(s => ({
    label: startCase(s),
    value: s
  }));
  const scopeOptions = values(CustomFilter.scope).map(s => ({ label: startCase(s), value: s }));
  const widgetOptions = values(CustomFilter.getDashboardFilterWidgets()).map(s => ({
    label: s,
    value: s
  }));

  const { programs, subjectTypes, encounterTypes, formMappings } = operationalModules;

  const [filterName, setFilterName] = useState(isNew ? "" : selectedFilter.name);
  const [filterConfig, setFilterConfig] = useState(isNew ? new DashboardFilterConfig() : selectedFilter.filterConfig);

  const programOptions = mapToOptions(MetaDataService.getProgramsForSubjectType(programs, null, formMappings));
  const encounterTypeOptions = mapToOptions(
    MetaDataService.getEncounterTypes_For_SubjectTypeAndPrograms(
      encounterTypes,
      null,
      _.get(filterConfig.observationBasedFilter, "programs"),
      formMappings
    )
  );
  const groupSubjectTypeOptions = mapToOptions(MetaDataService.getPossibleGroupSubjectTypesFor(subjectTypes, filterConfig.subjectType));

  const [messageStatus] = useState({ message: "", display: false });
  const [snackBarStatus, setSnackBarStatus] = useState(true);

  function updateFilterConfig() {
    setFilterConfig(filterConfig.clone());
  }

  const saveFilter = () => {
    const dashboardFilter = {
      name: filterName,
      filterConfig: filterConfig
    };
    dashboardFilterSave(dashboardFilter);
  };

  const [conceptSuggestions, setConceptSuggestions] = useState([]);
  const loadConcept = (value, callback) => {
    if (!value) {
      callback([]);
    }
    ConceptService.searchDashboardFilterConcepts(value).then(concepts => {
      const conceptOptions = map(concepts, concept => ({
        label: concept.name,
        value: concept
      }));
      setConceptSuggestions(conceptOptions);
      callback(conceptOptions);
    });
  };

  function onTypeChange(type) {
    filterConfig.setType(type);
    updateFilterConfig();
  }

  return (
    <div>
      <Title title="Dashboard Filter" />
      <Box boxShadow={2} p={1} bgcolor="background.paper">
        <DocumentationContainer filename={documentationFileName}>
          <Box>
            <div className="container" style={{ float: "left", marginBottom: 10 }}>
              <FormControl fullWidth>
                <AvniTextField
                  id="filterName"
                  label="Filter Name *"
                  autoComplete="off"
                  value={filterName}
                  onChange={event => setFilterName(event.target.value)}
                  style={{ width: 400 }}
                  toolTipKey={"APP_DESIGNER_FILTER_NAME"}
                />
              </FormControl>
              <Box m={1} />
              <SingleSelect
                name="Type"
                placeholder="Filter Type"
                value={filterConfig.type}
                options={typeOptions}
                onChange={x => onTypeChange(x.value)}
                toolTipKey="APP_DESIGNER_FILTER_TYPE"
              />
              <Box m={1} />
              {filterConfig.isGroupSubjectTypeFilter() && groupSubjectTypeOptions.length > 0 && (
                <SingleEntitySelect
                  name="Group Subject Type"
                  placeholder="Select Group Subject Type"
                  selectedEntity={filterConfig.groupSubjectTypeFilter.subjectType}
                  options={groupSubjectTypeOptions}
                  onChange={x => {
                    filterConfig.groupSubjectTypeFilter.subjectType = x.value;
                    updateFilterConfig();
                  }}
                  toolTipKey="APP_DESIGNER_FILTER_GROUP_SUBJECT_TYPE"
                />
              )}
              <Box m={1} />
              {filterConfig.isConceptTypeFilter() && (
                <div style={{ width: 400 }}>
                  <AvniFormLabel label={"Select Concept"} toolTipKey={"APP_DESIGNER_FILTER_CONCEPT_SEARCH"} position={"top"} />
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={conceptSuggestions}
                    value={
                      !_.isNil(filterConfig.observationBasedFilter.concept) && {
                        label: filterConfig.observationBasedFilter.concept.name,
                        value: filterConfig.observationBasedFilter.concept
                      }
                    }
                    placeholder={"Type to search"}
                    onChange={x => {
                      filterConfig.observationBasedFilter.concept = x.value;
                      updateFilterConfig();
                    }}
                    loadOptions={loadConcept}
                  />
                </div>
              )}
              <Box m={1} />
              {filterConfig.isConceptTypeFilter() && (
                <SingleSelect
                  name="Scope"
                  placeholder="Search Scope"
                  value={_.get(filterConfig.observationBasedFilter, "scope")}
                  options={scopeOptions}
                  onChange={scope => {
                    filterConfig.observationBasedFilter.scope = scope.value;
                    updateFilterConfig();
                  }}
                  toolTipKey="APP_DESIGNER_FILTER_SEARCH_SCOPE"
                />
              )}
              <Box m={1} />
              {filterConfig.willObservationBeInScopeOfProgramEnrolment() && (
                <MultipleEntitySelect
                  name="Programs"
                  placeholder="Select Programs"
                  selectedEntities={filterConfig.observationBasedFilter.programs}
                  options={programOptions}
                  onChange={xes => {
                    filterConfig.observationBasedFilter.programs = xes.map(x => x.value);
                    updateFilterConfig();
                  }}
                  toolTipKey="APP_DESIGNER_FILTER_PROGRAM"
                />
              )}
              <Box m={1} />
              {filterConfig.willObservationBeInScopeOfEncounter() && (
                <MultipleEntitySelect
                  name="Encounter Types"
                  placeholder="Select Encounter Types"
                  selectedEntities={filterConfig.observationBasedFilter.encounterTypes}
                  options={encounterTypeOptions}
                  onChange={xes => {
                    filterConfig.observationBasedFilter.encounterTypes = xes.map(x => x.value);
                    updateFilterConfig();
                  }}
                  toolTipKey="APP_DESIGNER_FILTER_ENCOUNTER_TYPE"
                />
              )}
              <Box m={1} />
              {filterConfig.isWidgetRequired() && (
                <SingleSelect
                  name="Widget Type"
                  placeholder="Select Widget Type"
                  value={filterConfig.widget}
                  options={widgetOptions}
                  onChange={w => {
                    filterConfig.widget = w.value;
                    updateFilterConfig();
                  }}
                  toolTipKey="APP_DESIGNER_FILTER_WIDGET_TYPE"
                />
              )}
              <Box m={1} />
            </div>
            <Box m={1}>
              <SaveComponent name={t("save")} onSubmit={saveFilter} disabledFlag={isSaveDisabled(filterConfig, filterName)} />
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
