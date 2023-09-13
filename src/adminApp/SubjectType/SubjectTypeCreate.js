import { Redirect, withRouter } from "react-router-dom";
import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import { subjectTypeInitialState } from "../Constant";
import { subjectTypeReducer } from "../Reducers";
import { validateGroup } from "./GroupHandlers";
import { useFormMappings, useLocationType } from "./effects";
import _, { identity } from "lodash";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AdvancedSettings } from "./AdvancedSettings";
import { bucketName, uploadImage } from "../../common/utils/S3Client";
import EditSubjectTypeFields from "./EditSubjectTypeFields";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import { getMessageTemplates, saveMessageRules } from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { connect } from "react-redux";
import Save from "@material-ui/icons/Save";

const SubjectTypeCreate = ({ organisationConfig }) => {
  const [subjectType, dispatch] = useReducer(subjectTypeReducer, subjectTypeInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [groupValidationError, setGroupValidationError] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(false);
  const [id, setId] = useState();
  const [formList, setFormList] = useState([]);
  const [formMappings, setFormMappings] = useState([]);
  const [locationTypes, setLocationsTypes] = useState([]);
  const [file, setFile] = React.useState();
  const [removeFile, setRemoveFile] = React.useState(false);
  const [{ rules, templates }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [],
    templates: []
  });
  const entityType = "Subject";

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  const onRulesChange = rules => {
    rulesDispatch({ type: "setRules", payload: rules });
  };

  const consumeFormMappingResult = (formMap, forms) => {
    setFormList(forms);
    setFormMappings(formMap);
  };

  useFormMappings(consumeFormMappingResult);
  useLocationType(types => setLocationsTypes(types));

  const onSubmit = async event => {
    event.preventDefault();

    const groupValidationError = validateGroup(subjectType.groupRoles);
    setGroupValidationError(groupValidationError);
    if (subjectType.name.trim() === "") {
      setError("");
      setNameValidation(true);
      return;
    }

    setNameValidation(false);

    if (!groupValidationError) {
      const [s3FileKey, error] = await uploadImage(
        subjectType.iconFileS3Key,
        file,
        bucketName.ICONS
      );
      if (error) {
        alert(error);
        return;
      }
      let subjectTypeSavePromise = () =>
        http
          .post("/web/subjectType", {
            ...subjectType,
            registrationFormUuid: _.get(subjectType, "registrationForm.formUUID"),
            iconFileS3Key: removeFile ? null : s3FileKey
          })
          .then(response => {
            if (response.status === 200) {
              setError("");
              setAlert(true);
              setId(response.data.id);
              return response;
            }
          })
          .then(response => {
            saveMessageRules(entityType, response.data.subjectTypeId, rules);
          })
          .catch(error => {
            setError(error.response.data.message);
          });

      return subjectTypeSavePromise();
    }
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <DocumentationContainer filename={"SubjectType.md"}>
          <Title title={"Create Subject Type "} />

          <div className="container" style={{ float: "left" }}>
            <form onSubmit={onSubmit}>
              <EditSubjectTypeFields
                subjectType={subjectType}
                onSetFile={setFile}
                onRemoveFile={setRemoveFile}
                formList={formList}
                groupValidationError={groupValidationError}
                dispatch={dispatch}
              />
              {organisationConfig && organisationConfig.enableMessaging ? (
                <MessageRules
                  rules={rules}
                  templates={templates}
                  onChange={onRulesChange}
                  entityType={entityType}
                  entityTypeId={subjectType.subjectTypeId}
                />
              ) : (
                <></>
              )}
              <p />
              <AdvancedSettings
                subjectType={subjectType}
                dispatch={dispatch}
                locationTypes={locationTypes}
                formMappings={formMappings}
              />
              <div />
              {nameValidation && (
                <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                  Empty name is not allowed.
                </FormLabel>
              )}
              {error !== "" && (
                <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                  {error}
                </FormLabel>
              )}
              <p />
              <Button color="primary" variant="contained" type="submit" startIcon={<Save />}>
                Save
              </Button>
            </form>
          </div>
        </DocumentationContainer>
      </Box>
      {alert && <Redirect to={"/appDesigner/subjectType/" + id + "/show"} />}
    </>
  );
};

const mapStateToProps = state => ({
  organisationConfig: state.app.organisationConfig
});
export default withRouter(connect(mapStateToProps)(SubjectTypeCreate));
