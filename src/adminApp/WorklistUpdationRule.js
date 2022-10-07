import React, { useEffect, useState } from "react";
import _, { isEmpty } from "lodash";
import http from "common/utils/httpClient";
import Paper from "@material-ui/core/Paper";
import { Title } from "react-admin";
import { default as UUID } from "uuid";
import Box from "@material-ui/core/Box";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import CustomizedSnackbar from "../formDesigner/components/CustomizedSnackbar";
import { SaveComponent } from "../common/components/SaveComponent";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { sampleWorkListUpdationRule } from "../formDesigner/common/SampleRule";
import { JSEditor } from "../common/components/JSEditor";

export const WorklistUpdationRule = () => {
  const emptyOrgSettings = {
    uuid: UUID.v4(),
    settings: { languages: [], myDashboardFilters: [], searchFilters: [] },
    worklistUpdationRule: ""
  };
  const [worklistUpdationRule, setWorklistUpdationRule] = useState("");
  const [notificationAlert, setNotificationAlert] = useState(false);
  const [settings, setSettings] = useState(emptyOrgSettings);
  const [subjectTypes, setSubjectTypes] = React.useState();
  const [enableRuleSave, setEnableRuleSave] = React.useState(false);

  const setRule = rule => {
    setWorklistUpdationRule(rule);
    setEnableRuleSave(true);
  };

  const createOrgSettings = setting => {
    const { uuid, settings } = setting;
    const { languages, myDashboardFilters, searchFilters } = settings;
    return {
      uuid: uuid,
      settings: {
        languages: _.isNil(languages) ? [] : languages,
        myDashboardFilters: _.isNil(myDashboardFilters) ? [] : myDashboardFilters,
        searchFilters: _.isNil(searchFilters) ? [] : searchFilters
      }
    };
  };

  useEffect(() => {
    http.get("/subjectType").then(res => {
      res.data && setSubjectTypes(res.data._embedded.subjectType);
    });
  }, []);

  useEffect(() => {
    http.get("/organisationConfig").then(res => {
      const settings = _.filter(res.data._embedded.organisationConfig);
      const orgSettings = isEmpty(settings) ? emptyOrgSettings : createOrgSettings(settings[0]);
      setSettings(orgSettings);
      res.data._embedded.organisationConfig[0] &&
        setWorklistUpdationRule(
          res.data._embedded.organisationConfig[0].worklistUpdationRule
            ? res.data._embedded.organisationConfig[0].worklistUpdationRule
            : ""
        );
    });
  }, []);

  const onSaveWorklistUpdationRule = event => {
    http
      .put("/organisationConfig", {
        uuid: settings.uuid,
        settings: settings.settings,
        worklistUpdationRule: worklistUpdationRule
      })
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          setNotificationAlert(true);
          setEnableRuleSave(false);
        }
      });
  };

  return _.isNil(subjectTypes) ? (
    <div />
  ) : (
    <Box>
      <Title title="Worklist Updation Rule" />
      <Paper>
        <DocumentationContainer filename={"WorklistUpdationRule.md"}>
          <ExpansionPanel expanded={true}>
            <ExpansionPanelSummary aria-controls="panel1a-content" id="panel1a-header">
              <span style={{ fontSize: "1.25rem", fontFamily: "Roboto", fontWeight: "500" }}>
                Worklist Updation Rule
              </span>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <JSEditor
                value={worklistUpdationRule ? worklistUpdationRule : sampleWorkListUpdationRule()}
                onValueChange={event => setRule(event)}
              />
            </ExpansionPanelDetails>

            <SaveComponent
              name="Save"
              onSubmit={onSaveWorklistUpdationRule}
              styleClass={{ marginLeft: "25px", marginBottom: "10px" }}
              disabledFlag={!enableRuleSave}
            />
          </ExpansionPanel>
        </DocumentationContainer>
      </Paper>
      {notificationAlert && (
        <CustomizedSnackbar
          message="Worklist updation rule updated."
          getDefaultSnackbarStatus={notificationAlert => setNotificationAlert(notificationAlert)}
          defaultSnackbarStatus={notificationAlert}
        />
      )}
    </Box>
  );
};
