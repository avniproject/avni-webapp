import { useNavigate } from "react-router-dom";
import { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { Box, FormLabel } from "@mui/material";
import { Title } from "react-admin";
import { subjectTypeInitialState } from "../Constant";
import { subjectTypeReducer } from "../Reducers";
import { validateGroup } from "./GroupHandlers";
import { useFormMappings, useLocationType } from "./effects";
import _, { identity } from "lodash";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AdvancedSettings } from "./AdvancedSettings";
import { MediaFolder, uploadImage } from "../../common/utils/S3Client";
import EditSubjectTypeFields from "./EditSubjectTypeFields";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import {
  getMessageTemplates,
  saveMessageRules,
} from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { useSelector } from "react-redux";
import { getDBValidationError } from "../../formDesigner/common/ErrorUtil";
import { SaveComponent } from "../../common/components/SaveComponent";

const SubjectTypeCreate = () => {
  const navigate = useNavigate();
  const organisationConfig = useSelector(
    (state) => state.app.organisationConfig,
  );

  const [subjectType, dispatch] = useReducer(
    subjectTypeReducer,
    subjectTypeInitialState,
  );
  const [nameValidation, setNameValidation] = useState(false);
  const [groupValidationError, setGroupValidationError] = useState(false);
  const [error, setError] = useState("");
  const [msgError, setMsgError] = useState("");
  const [successAlert, setSuccessAlert] = useState(false);
  const [id, setId] = useState();
  const [formList, setFormList] = useState([]);
  const [formMappings, setFormMappings] = useState([]);
  const [locationTypes, setLocationsTypes] = useState([]);
  const [file, setFile] = useState();
  const [removeFile, setRemoveFile] = useState(false);
  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(
    MessageReducer,
    {
      rules: [],
      templates: [],
    },
  );
  const entityType = "Subject";

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  useEffect(() => {
    if (successAlert && id) {
      navigate(`/appDesigner/subjectType/${id}/show`);
    }
  }, [successAlert, id, navigate]);

  const onRulesChange = (rules) => {
    rulesDispatch({ type: "setRules", payload: rules });
  };

  const consumeFormMappingResult = (formMap, forms) => {
    setFormList(forms);
    setFormMappings(formMap);
  };

  useFormMappings(consumeFormMappingResult);
  useLocationType((types) => setLocationsTypes(types));

  const onSubmit = async () => {
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
        MediaFolder.ICONS,
      );
      if (error) {
        alert(error);
        return;
      }
      let subjectTypeSavePromise = () =>
        http
          .post("/web/subjectType", {
            ...subjectType,
            registrationFormUuid: _.get(
              subjectType,
              "registrationForm.formUUID",
            ),
            iconFileS3Key: removeFile ? null : s3FileKey,
          })
          .then((response) => {
            if (response.status === 200) {
              setError("");
              setMsgError("");
              setSuccessAlert(true);
              setId(response.data.id);
              return response;
            }
          })
          .then((response) =>
            saveMessageRules(entityType, response.data.subjectTypeId, rules),
          )
          .catch((error) => {
            setSuccessAlert(false);
            error.response.data.message
              ? setError(error.response.data.message)
              : setMsgError(getDBValidationError(error));
          });
      return subjectTypeSavePromise();
    }
  };

  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper",
        }}
      >
        <DocumentationContainer filename={"SubjectType.md"}>
          <Title title={"Create Subject Type "} />
          <div className="container" style={{ float: "left" }}>
            <EditSubjectTypeFields
              subjectType={subjectType}
              onSetFile={setFile}
              onRemoveFile={setRemoveFile}
              formList={formList}
              groupValidationError={groupValidationError}
              dispatch={dispatch}
              source={"create"}
            />
            {organisationConfig && organisationConfig.enableMessaging ? (
              <MessageRules
                templateFetchError={templateFetchError}
                rules={rules}
                templates={templates}
                onChange={onRulesChange}
                entityType={entityType}
                entityTypeId={subjectType.subjectTypeId}
                msgError={msgError}
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
            <SaveComponent onSubmit={onSubmit} name="Save" />
          </div>
        </DocumentationContainer>
      </Box>
      {successAlert && <div />}
    </>
  );
};

export default SubjectTypeCreate;
