import { useNavigate } from "react-router-dom";
import { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { Box, FormLabel } from "@mui/material";
import { Title, useNotify } from "react-admin";
import { useSelector } from "react-redux";
import _ from "lodash";

import { subjectTypeInitialState } from "../Constant";
import { subjectTypeReducer } from "../Reducers";
import { validateGroup } from "./GroupHandlers";
import { useFormMappings, useLocationType } from "./effects";

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

import { showSaveError } from "../service/showSaveError";
import { SaveComponent } from "../../common/components/SaveComponent";

import {
  isAttendanceConfigIncompleteError,
  buildAttendanceConfigIncompleteMessage,
} from "./attendanceConfigErrors";

const SubjectTypeCreate = () => {
  const navigate = useNavigate();
  const notify = useNotify();

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
  }, []);

  useEffect(() => {
    if (successAlert && id) {
      navigate(`/appDesigner/subjectType/${id}/show`);
    }
  }, [successAlert, id, navigate]);

  const onRulesChange = (updatedRules) => {
    rulesDispatch({
      type: "setRules",
      payload: updatedRules,
    });
  };

  const consumeFormMappingResult = (formMap, forms) => {
    setFormList(forms);
    setFormMappings(formMap);
  };

  useFormMappings(consumeFormMappingResult);

  useLocationType((types) => {
    setLocationsTypes(types);
  });

  const onSubmit = async () => {
    const hasGroupValidationError = validateGroup(subjectType.groupRoles);

    setGroupValidationError(hasGroupValidationError);
    setError("");
    setMsgError("");

    if (subjectType.name.trim() === "") {
      setNameValidation(true);
      return;
    }

    setNameValidation(false);

    if (hasGroupValidationError) {
      return;
    }

    try {
      const [s3FileKey, uploadError] = await uploadImage(
        subjectType.iconFileS3Key,
        file,
        MediaFolder.ICONS,
      );

      if (uploadError) {
        alert(uploadError);
        return;
      }

      const response = await http.post("/web/subjectType", {
        ...subjectType,
        registrationFormUuid: _.get(subjectType, "registrationForm.formUUID"),
        iconFileS3Key: removeFile ? null : s3FileKey,
      });

      if (response.status !== 200) {
        throw new Error("Failed to save subject type.");
      }

      await saveMessageRules(entityType, response.data.subjectTypeId, rules);

      setId(response.data.id);
      setSuccessAlert(true);
      setError("");
      setMsgError("");
    } catch (saveError) {
      setSuccessAlert(false);

      if (isAttendanceConfigIncompleteError(saveError)) {
        notify(buildAttendanceConfigIncompleteMessage(saveError), {
          type: "error",
          multiLine: true,
          autoHideDuration: 8000,
        });

        return;
      }

      showSaveError(saveError, {
        setError,
        setMsgError,
      });
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
        <DocumentationContainer filename="SubjectType.md">
          <Title title="Create Subject Type" />

          <div className="container" style={{ float: "left" }}>
            <EditSubjectTypeFields
              subjectType={subjectType}
              onSetFile={setFile}
              onRemoveFile={setRemoveFile}
              formList={formList}
              groupValidationError={groupValidationError}
              dispatch={dispatch}
              source="create"
            />

            {organisationConfig?.enableMessaging ? (
              <MessageRules
                templateFetchError={templateFetchError}
                rules={rules}
                templates={templates}
                onChange={onRulesChange}
                entityType={entityType}
                entityTypeId={subjectType.subjectTypeId}
                msgError={msgError}
              />
            ) : null}

            <p />

            <AdvancedSettings
              subjectType={subjectType}
              dispatch={dispatch}
              locationTypes={locationTypes}
              formMappings={formMappings}
            />

            <div />

            {nameValidation && (
              <FormLabel
                error
                sx={{
                  mt: "10px",
                  fontSize: "12px",
                }}
              >
                Empty name is not allowed.
              </FormLabel>
            )}

            {error !== "" && (
              <FormLabel
                error
                sx={{
                  mt: "10px",
                  fontSize: "12px",
                }}
              >
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
