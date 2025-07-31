import { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Button, FormLabel, Grid } from "@mui/material";
import { Title } from "react-admin";
import { Visibility, Delete } from "@mui/icons-material";
import { subjectTypeInitialState } from "../Constant";
import { subjectTypeReducer } from "../Reducers";
import { validateGroup } from "./GroupHandlers";
import { useFormMappings, useLocationType } from "./effects";
import { findRegistrationForm } from "../domain/formMapping";
import _, { identity } from "lodash";
import { SaveComponent } from "../../common/components/SaveComponent";
import { AdvancedSettings } from "./AdvancedSettings";
import { MediaFolder, uploadImage } from "../../common/utils/S3Client";
import EditSubjectTypeFields from "./EditSubjectTypeFields";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import {
  getMessageRules,
  getMessageTemplates,
  saveMessageRules
} from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { getDBValidationError } from "../../formDesigner/common/ErrorUtil";

const SubjectTypeEdit = () => {
  const organisationConfig = useSelector(state => state.app.organisationConfig);
  const { id } = useParams();
  const navigate = useNavigate();
  const [subjectType, dispatch] = useReducer(
    subjectTypeReducer,
    subjectTypeInitialState
  );
  const [nameValidation, setNameValidation] = useState(false);
  const [groupValidationError, setGroupValidationError] = useState(false);
  const [error, setError] = useState("");
  const [msgError, setMsgError] = useState("");
  const [redirectShow, setRedirectShow] = useState(false);
  const [subjectTypeData, setSubjectTypeData] = useState({});
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [formList, setFormList] = useState([]);
  const [formMappings, setFormMappings] = useState([]);
  const [firstTimeFormValueToggle, setFirstTimeFormValueToggle] = useState(
    false
  );
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [locationTypes, setLocationsTypes] = useState([]);
  const [file, setFile] = useState();
  const [removeFile, setRemoveFile] = useState(false);
  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(
    MessageReducer,
    {
      rules: [],
      templates: []
    }
  );
  const entityType = "Subject";

  useEffect(() => {
    getMessageRules(entityType, subjectType.subjectTypeId, rulesDispatch);
    return identity;
  }, [subjectType]);

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  useEffect(() => {
    if (redirectShow) {
      navigate(`/appDesigner/subjectType/${id}/show`);
    }
  }, [redirectShow, navigate, id]);

  useEffect(() => {
    if (deleteAlert) {
      navigate("/appDesigner/subjectType");
    }
  }, [deleteAlert, navigate]);

  const onRulesChange = rules => {
    rulesDispatch({ type: "setRules", payload: rules });
  };

  const consumeFormMappingResult = (formMap, forms, subjectTypes) => {
    setFormMappings(formMap);
    setFormList(forms);
    setSubjectTypes(subjectTypes);
  };

  useFormMappings(consumeFormMappingResult);
  useLocationType(types => setLocationsTypes(types));

  useEffect(() => {
    http
      .get("/web/subjectType/" + id)
      .then(response => response.data)
      .then(result => {
        setSubjectTypeData(result);
        dispatch({ type: "setData", payload: result });
      });
  }, [id]);

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
        MediaFolder.ICONS
      );
      if (error) {
        alert(error);
        return;
      }
      let subjectTypeSavePromise = () =>
        http
          .put("/web/subjectType/" + id, {
            ...subjectType,
            name: subjectType.name,
            id: id,
            organisationId: subjectTypeData.organisationId,
            active: subjectType.active,
            subjectTypeOrganisationId:
              subjectTypeData.subjectTypeOrganisationId,
            voided: subjectTypeData.voided,
            group: subjectType.group,
            household: subjectType.household,
            groupRoles: subjectType.groupRoles,
            registrationFormUuid: _.get(
              subjectType,
              "registrationForm.formUUID"
            ),
            type: subjectType.type,
            subjectSummaryRule: subjectType.subjectSummaryRule,
            locationTypeUUIDs: subjectType.locationTypeUUIDs,
            iconFileS3Key: removeFile ? null : s3FileKey
          })
          .then(response => {
            if (response.status === 200) {
              setError("");
              setMsgError("");
            }
          })
          .then(() =>
            saveMessageRules(entityType, subjectType.subjectTypeId, rules)
          )
          .then(() => setRedirectShow(true))
          .catch(error => {
            error.response.data.message
              ? setError(error.response.data.message)
              : setMsgError(getDBValidationError(error));
          });

      return subjectTypeSavePromise();
    }
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete subject type?")) {
      http.delete("/web/subjectType/" + id).then(response => {
        if (response.status === 200) {
          setDeleteAlert(true);
        }
      });
    }
  };

  if (
    !_.isEmpty(formMappings) &&
    !_.isEmpty(subjectType.uuid) &&
    !firstTimeFormValueToggle &&
    _.isEmpty(subjectType.registrationForm)
  ) {
    setFirstTimeFormValueToggle(true);
    let payload = findRegistrationForm(formMappings, subjectType);
    dispatch({ type: "registrationForm", payload: payload });
  }

  const disableDelete = _.find(
    subjectTypes,
    ({ group, memberSubjectUUIDs }) =>
      group && _.includes(memberSubjectUUIDs.split(","), subjectType.uuid)
  );

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title={"Edit subject type"} />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        <Button
          color="primary"
          type="button"
          onClick={() => navigate(`/appDesigner/subjectType/${id}/show`)}
        >
          <Visibility /> Show
        </Button>
      </Grid>
      <EditSubjectTypeFields
        subjectType={subjectType}
        dispatch={dispatch}
        formList={formList}
        onSetFile={setFile}
        onRemoveFile={setRemoveFile}
        groupValidationError={groupValidationError}
        source={"edit"}
      />
      <MessageRules
        rules={rules}
        templates={templates}
        onChange={onRulesChange}
        templateFetchError={templateFetchError}
        entityType={entityType}
        entityTypeId={subjectType.subjectTypeId}
        error={msgError}
      />
      <AdvancedSettings
        subjectType={subjectType}
        dispatch={dispatch}
        groupValidationError={groupValidationError}
        organisationConfig={organisationConfig}
        locationTypes={locationTypes}
        formMappings={formMappings}
      />
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
      <Grid container sx={{ justifyContent: "space-between", mt: 2 }}>
        <Grid item>
          <SaveComponent
            name="save"
            onSubmit={onSubmit}
            styles={{ marginLeft: "14px" }}
          />
        </Grid>
        <Grid item>
          <Button
            sx={{
              backgroundColor: disableDelete ? "lightgray" : "#f44336",
              color: "white"
            }}
            startIcon={<Delete />}
            onClick={onDelete}
            disabled={disableDelete}
          >
            Delete
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubjectTypeEdit;
