import React, { useState } from "react";
import { FormControl, Input, InputLabel, Select } from "@material-ui/core";
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
  const encounterName =
    searchType === "programEncounter" || searchType === "encounter"
      ? encounterTypes.find(e => e.encounterType.uuid === searchParameters.encounterTypeUUID).name
      : "";
  const programName =
    searchType === "programEncounter" || searchType === "programEnrolment"
      ? programs.find(e => e.program.uuid === searchParameters.programUUID).name
      : "";

  const [filterName, setFilterName] = useState(titleKey);
  const [conceptNameState, setConceptName] = useState({ conceptName, error: "" });
  const [scope, setScope] = useState(searchType);
  const [encounterNameState, setEncounterName] = useState(encounterName);
  const [programNameState, setProgramName] = useState(programName);
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
    const encType = encounterTypes.find(e => e.name === encounterNameState);
    const prog = programs.find(p => p.program.name === programNameState);
    const newFilter = {
      titleKey: filterName,
      searchType: scope,
      conceptUUID: concepts.find(concept => concept.name === conceptNameState.conceptName).uuid,
      searchParameters: {
        programUUID: _.isNil(prog) ? "" : prog.program.uuid,
        encounterTypeUUID: _.isNil(encType) ? "" : encType.encounterType.uuid
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
        {!_.isEmpty(programs) && !_.isEmpty(encounterTypes) && (
          <Box m={4}>
            <Grid container item sm={12}>
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
              <Grid item sm={12}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="Scope">Search Scope</InputLabel>
                  <Select
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
                  </Select>
                </FormControl>
              </Grid>
              {(scope === "programEncounter" || scope === "programEnrolment") && (
                <Grid item sm={12}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="Program">Program</InputLabel>
                    <Select
                      id="Program"
                      name="Program"
                      value={programNameState}
                      onChange={event => setProgramName(event.target.value)}
                    >
                      {programs != null &&
                        programs.map(program => (
                          <MenuItem key={program.name} value={program.name}>
                            {program.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {(scope === "programEncounter" || scope === "encounter") && (
                <Grid item sm={12}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="Encounter">Encounter Type</InputLabel>
                    <Select
                      id="Encounter"
                      name="Encounter"
                      value={encounterNameState}
                      onChange={event => setEncounterName(event.target.value)}
                    >
                      {encounterTypes != null &&
                        encounterTypes.map(encounterType => (
                          <MenuItem key={encounterType.name} value={encounterType.name}>
                            {encounterType.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
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
          </Box>
        )}
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
