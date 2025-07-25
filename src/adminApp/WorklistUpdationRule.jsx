import { useEffect, useState } from "react";
import _, { isEmpty } from "lodash";
import { httpClient as http } from "common/utils/httpClient";
import {
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import { Title } from "react-admin";
import { default as UUID } from "uuid";
import CustomizedSnackbar from "../formDesigner/components/CustomizedSnackbar";
import { SaveComponent } from "../common/components/SaveComponent";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { sampleWorkListUpdationRule } from "../formDesigner/common/SampleRule";
import { JSEditor } from "../common/components/JSEditor";
import commonApi from "../common/service";

export const WorklistUpdationRule = () => {
  const emptyOrgSettings = {
    uuid: UUID.v4(),
    settings: { languages: [], myDashboardFilters: [], searchFilters: [] },
    worklistUpdationRule: ""
  };
  const [worklistUpdationRule, setWorklistUpdationRule] = useState("");
  const [notificationAlert, setNotificationAlert] = useState(false);
  const [settings, setSettings] = useState(emptyOrgSettings);
  const [subjectTypes, setSubjectTypes] = useState();
  const [enableRuleSave, setEnableRuleSave] = useState(false);

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
        myDashboardFilters: _.isNil(myDashboardFilters)
          ? []
          : myDashboardFilters,
        searchFilters: _.isNil(searchFilters) ? [] : searchFilters
      }
    };
  };

  useEffect(() => {
    const fetchSubjectTypes = async () =>
      setSubjectTypes(await commonApi.fetchSubjectTypes());
    fetchSubjectTypes();
    return () => {};
  }, []);

  useEffect(() => {
    http.get("/organisationConfig").then(res => {
      const settings = _.filter(res.data._embedded.organisationConfig);
      const orgSettings = isEmpty(settings)
        ? emptyOrgSettings
        : createOrgSettings(settings[0]);
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
    return http
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
          <Accordion expanded={true}>
            <AccordionSummary
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  fontFamily: "Roboto",
                  fontWeight: "500"
                }}
              >
                Worklist Updation Rule
              </span>
            </AccordionSummary>
            <AccordionDetails>
              <JSEditor
                value={
                  worklistUpdationRule
                    ? worklistUpdationRule
                    : sampleWorkListUpdationRule()
                }
                onValueChange={event => setRule(event)}
              />
            </AccordionDetails>

            <SaveComponent
              name="Save"
              onSubmit={onSaveWorklistUpdationRule}
              styleClass={{ marginLeft: "25px", marginBottom: "10px" }}
              disabledFlag={!enableRuleSave}
            />
          </Accordion>
        </DocumentationContainer>
      </Paper>
      {notificationAlert && (
        <CustomizedSnackbar
          message="Worklist updation rule updated."
          getDefaultSnackbarStatus={notificationAlert =>
            setNotificationAlert(notificationAlert)
          }
          defaultSnackbarStatus={notificationAlert}
        />
      )}
    </Box>
  );
};
