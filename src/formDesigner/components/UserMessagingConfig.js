import React, { useEffect, useReducer, useState } from "react";
import _, { identity, isEmpty } from "lodash";
import http from "common/utils/httpClient";
import Paper from "@mui/material/Paper";
import { Title } from "react-admin";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CustomizedSnackbar from "./CustomizedSnackbar";
import { SaveComponent } from "../../common/components/SaveComponent";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import MessageRules from "./MessageRule/MessageRules";
import { MessageReducer } from "./MessageRule/MessageReducer";
import { getMessageRules, getMessageTemplates, saveMessageRules } from "../../adminApp/service/MessageService";
import { getDBValidationError } from "../common/ErrorUtil";

export const UserMessagingConfig = () => {
  const entityType = "User";
  const receiverType = "User";
  const entityTypeId = -1;

  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [],
    templates: []
  });

  useEffect(() => {
    getMessageRules(entityType, entityTypeId, rulesDispatch);
    return identity;
  }, []);

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  const onRulesChange = rules => {
    rulesDispatch({ type: "setRules", payload: rules });
    setEnableMessagingConfigSave(true);
  };

  const [enableMessagingConfigSave, setEnableMessagingConfigSave] = React.useState(false);
  const [notificationAlert, setNotificationAlert] = useState(false);
  const [msgError, setMsgError] = useState("");

  const emptyOrgSettings = {
    enableMessaging: false
  };
  const [settings, setSettings] = useState(emptyOrgSettings);
  const createOrgSettings = orgConfig => {
    const { settings } = orgConfig;
    const { enableMessaging } = settings;
    return {
      enableMessaging: _.isNil(enableMessaging) ? false : enableMessaging
    };
  };

  useEffect(() => {
    http.get("/organisationConfig").then(res => {
      const orgConfig = _.filter(res.data._embedded.organisationConfig);
      const orgSettings = isEmpty(orgConfig) ? emptyOrgSettings : createOrgSettings(orgConfig[0]);
      setSettings(orgSettings);
    });
  }, []);

  const onSaveUserMessagingConfig = event => {
    return saveMessageRules(entityType, entityTypeId, rules)
      .then(response => {
        setNotificationAlert(true);
        setEnableMessagingConfigSave(false);
        setMsgError("");
      })
      .catch(error => {
        setMsgError(getDBValidationError(error));
      });
  };

  return (
    <Box>
      <Title title="Message Rule for User Creation" />
      <Paper>
        <DocumentationContainer filename={"UserMessagingConfig.md"}>
          <Accordion expanded={true}>
            <AccordionSummary aria-controls="panel1a-content" id="panel1a-header">
              <span style={{ fontSize: "1.25rem", fontFamily: "Roboto", fontWeight: "500" }}>User Messaging Config</span>
            </AccordionSummary>
            <AccordionDetails>
              <div className="container" style={{ float: "left" }}>
                {settings && settings.enableMessaging ? (
                  <MessageRules
                    templateFetchError={templateFetchError}
                    rules={rules}
                    templates={templates}
                    onChange={onRulesChange}
                    entityType={entityType}
                    entityTypeId={entityTypeId}
                    fixedReceiverType={receiverType}
                    msgError={msgError}
                  />
                ) : (
                  <div>
                    <span style={{ fontSize: "1rem", fontFamily: "Roboto", fontWeight: "400" }}>
                      Enable Messaging for Organisation in-order to be able to do this configuration.
                    </span>
                  </div>
                )}
              </div>
            </AccordionDetails>

            <SaveComponent
              name="Save"
              onSubmit={onSaveUserMessagingConfig}
              styleClass={{ marginLeft: "25px", marginBottom: "10px" }}
              disabledFlag={!enableMessagingConfigSave}
            />
          </Accordion>
        </DocumentationContainer>
      </Paper>
      {notificationAlert && (
        <CustomizedSnackbar
          message="User Messaging Config updated."
          getDefaultSnackbarStatus={notificationAlert => setNotificationAlert(notificationAlert)}
          defaultSnackbarStatus={notificationAlert}
        />
      )}
    </Box>
  );
};
