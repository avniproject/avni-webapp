import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FormControl, Input, InputLabel, Select as SingleSelect } from "@material-ui/core";
import Select from "react-select";
import _ from "lodash";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import AutoSuggestSingleSelection from "../../formDesigner/components/AutoSuggestSingleSelection";
import FormHelperText from "@material-ui/core/FormHelperText";
import axios from "axios";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import { Title } from "react-admin";

export const CreateEditFilters = props => {
  if (_.isNil(props.location.state)) {
    return <div />;
  }

  const scopes = ["programEncounter", "programEnrolment", "registration", "encounter"];

  const emptyFilter = { conceptName: "", searchType: "", titleKey: "", searchParameters: "" };
  const { programs, encounterTypes, concepts } = props.location.state;
  const { conceptName, searchType, titleKey, searchParameters } =
    props.location.state.selectedFilter || emptyFilter;

  const programOptions = programs.map(p => ({ label: p.name, value: p.program.uuid }));
  const encounterTypeOptions = encounterTypes.map(e => ({
    label: e.name,
    value: e.encounterType.uuid
  }));

  const [filterName, setFilterName] = useState(titleKey);
  const [conceptNameState, setConceptName] = useState({ conceptName, error: "" });
  const [scope, setScope] = useState(searchType);
  const encNames =
    (searchParameters.encounterTypeUUIDs &&
      encounterTypeOptions.filter(l => searchParameters.encounterTypeUUIDs.includes(l.value))) ||
    [];
  const progNames =
    (searchParameters.programUUIDs &&
      programOptions.filter(l => searchParameters.programUUIDs.includes(l.value))) ||
    [];
  const [encounterNameState, setEncounterName] = useState(encNames);
  const [programNameState, setProgramName] = useState(progNames);
  const [messageStatus, setMessageStatus] = useState({ message: "", display: false });
  const [snackBarStatus, setSnackBarStatus] = useState(true);

  const checkForConceptError = conceptName => {
    const error = "Only coded concepts are allowed";
    _.isEmpty(concepts.filter(c => c.name === conceptName))
      ? setConceptName({ conceptName, error })
      : setConceptName({ conceptName, error: "" });
  };

  const saveDisabled = () => {
    const allRequiredStatus =
      _.isEmpty(filterName) ||
      _.isEmpty(scope) ||
      _.isEmpty(conceptNameState.conceptName) ||
      !_.isEmpty(conceptNameState.error);
    switch (scope) {
      case "registration":
        return allRequiredStatus;
      case "programEnrolment":
        return allRequiredStatus || _.isEmpty(programNameState);
      case "programEncounter":
        return allRequiredStatus || _.isEmpty(programNameState) || _.isEmpty(encounterNameState);
      case "encounter":
        return allRequiredStatus || _.isEmpty(encounterNameState);
      default:
        return true;
    }
  };

  const saveFilter = () => {
    const encType = _.isNil(encounterNameState) ? [] : encounterNameState.map(l => l.value);
    const prog = _.isNil(programNameState) ? [] : programNameState.map(l => l.value);
    const newFilter = {
      titleKey: filterName,
      searchType: scope,
      conceptUUID: concepts.find(concept => concept.name === conceptNameState.conceptName).uuid,
      searchParameters: {
        programUUIDs: scope === "registration" ? [] : prog,
        encounterTypeUUIDs: scope === "registration" || scope === "programEnrolment" ? [] : encType
      }
    };
    const data = getNewFilterData(newFilter);
    axios
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
    const setting = props.location.state.settings;
    const filterType = props.location.state.filterType;
    const oldFilters = setting.settings[filterType];
    const newFilters = _.isNil(props.location.state.selectedFilter)
      ? [...oldFilters, newFilter]
      : [...oldFilters.filter(f => f.titleKey !== titleKey), newFilter];
    return {
      uuid: setting.uuid,
      settings: {
        languages: setting.settings.languages,
        myDashboardFilters:
          filterType === "myDashboardFilters" ? newFilters : setting.settings.myDashboardFilters,
        searchFilters: filterType === "searchFilters" ? newFilters : setting.settings.searchFilters
      }
    };
  };

  return (
    <div>
      <Title title="Filter Config" />
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Box mr={130}>
          {!_.isEmpty(programs) && !_.isEmpty(encounterTypes) && (
            <Grid container justify="flex-start">
              <Grid item sm={12}>
                <FormControl fullWidth>
                  <InputLabel>Name</InputLabel>
                  <Input
                    disableUnderline={false}
                    value={filterName}
                    onChange={event => setFilterName(event.target.value)}
                  />
                </FormControl>
              </Grid>
              <Box m={0.5} />
              <Grid item sm={12}>
                <FormControl fullWidth>
                  <AutoSuggestSingleSelection
                    visibility={false}
                    showAnswer={{ name: conceptNameState.conceptName }}
                    onChangeAnswerName={concept => checkForConceptError(concept)}
                    finalReturn={true}
                    index={0}
                    label="Concept"
                  />
                  {!_.isEmpty(conceptNameState.error) && (
                    <FormHelperText error>{conceptNameState.error}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Box m={0.5} />
              <Grid item sm={12}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="Scope">Search Scope</InputLabel>
                  <SingleSelect
                    id="Scope"
                    name="Scope"
                    value={scope}
                    onChange={event => setScope(event.target.value)}
                  >
                    {scopes.map(scope => (
                      <MenuItem key={scope} value={scope}>
                        {scope}
                      </MenuItem>
                    ))}
                  </SingleSelect>
                </FormControl>
              </Grid>
              <Box m={0.5} />
              {scope === "programEnrolment" && (
                <Grid item sm={12}>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.54)" }}>Progam</div>
                    <Select
                      isMulti
                      placeholder={"Select Program"}
                      value={programNameState}
                      options={programOptions}
                      onChange={name => setProgramName(name)}
                    />
                  </div>
                </Grid>
              )}
              <Box m={0.5} />
              {scope === "programEncounter" && (
                <Grid item sm={12}>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.54)" }}>Progam</div>
                    <Select
                      placeholder={"Select Program"}
                      value={programNameState}
                      options={programOptions}
                      onChange={name => setProgramName([name])}
                    />
                  </div>
                </Grid>
              )}
              <Box m={0.5} />
              {(scope === "programEncounter" || scope === "encounter") && (
                <Grid item sm={12}>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.54)" }}>Encounter Type</div>
                    <Select
                      isMulti
                      placeholder={"Select Encounter Type"}
                      value={encounterNameState}
                      options={encounterTypeOptions}
                      onChange={name => setEncounterName(name)}
                    />
                  </div>
                </Grid>
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
