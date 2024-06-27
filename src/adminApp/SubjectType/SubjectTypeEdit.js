import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import { subjectTypeInitialState } from "../Constant";
import { subjectTypeReducer } from "../Reducers";
import { validateGroup } from "./GroupHandlers";
import { useFormMappings, useLocationType } from "./effects";
import { findRegistrationForm } from "../domain/formMapping";
import _, { identity } from "lodash";
import { SaveComponent } from "../../common/components/SaveComponent";
import { AdvancedSettings } from "./AdvancedSettings";
import { bucketName, uploadImage } from "../../common/utils/S3Client";
import EditSubjectTypeFields from "./EditSubjectTypeFields";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import { getMessageRules, getMessageTemplates, saveMessageRules } from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { connect } from "react-redux";
import { SubjectTypeType } from "./Types";

const SubjectTypeEdit = ({ organisationConfig, ...props }) => {
  const [subjectType, dispatch] = useReducer(subjectTypeReducer, subjectTypeInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [groupValidationError, setGroupValidationError] = useState(false);
  const [error, setError] = useState("");
  const [redirectShow, setRedirectShow] = useState(false);
  const [subjectTypeData, setSubjectTypeData] = useState({});
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [formList, setFormList] = useState([]);
  const [formMappings, setFormMappings] = useState([]);
  const [firstTimeFormValueToggle, setFirstTimeFormValueToggle] = useState(false);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [locationTypes, setLocationsTypes] = useState([]);
  const [file, setFile] = React.useState();
  const [removeFile, setRemoveFile] = React.useState(false);
  const [{ rules, templates }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [],
    templates: []
  });
  const entityType = "Subject";
  useEffect(() => {
    getMessageRules(entityType, subjectType.subjectTypeId, rulesDispatch);
    return identity;
  }, [subjectType]);

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

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
      .get("/web/subjectType/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setSubjectTypeData(result);
        dispatch({ type: "setData", payload: result });
      });
  }, []);

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
      const [s3FileKey, error] = await uploadImage(subjectType.iconFileS3Key, file, bucketName.ICONS);
      if (error) {
        alert(error);
        return;
      }
      let subjectTypeSavePromise = () =>
        http
          .put("/web/subjectType/" + props.match.params.id, {
            ...subjectType,
            name: subjectType.name,
            id: props.match.params.id,
            organisationId: subjectTypeData.organisationId,
            active: subjectType.active,
            subjectTypeOrganisationId: subjectTypeData.subjectTypeOrganisationId,
            voided: subjectTypeData.voided,
            group: subjectType.group,
            household: subjectType.household,
            groupRoles: subjectType.groupRoles,
            registrationFormUuid: _.get(subjectType, "registrationForm.formUUID"),
            type: subjectType.type,
            subjectSummaryRule: subjectType.subjectSummaryRule,
            locationTypeUUIDs: subjectType.locationTypeUUIDs,
            iconFileS3Key: removeFile ? null : s3FileKey
          })
          .then(response => {
            if (response.status === 200) {
              setError("");
            }
          })
          .then(() => saveMessageRules(entityType, subjectType.subjectTypeId, rules))
          .then(() => setRedirectShow(true))
          .catch(error => {
            setError(error.response.data.message);
          });

      return subjectTypeSavePromise();
    }
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete subject type?")) {
      http.delete("/web/subjectType/" + props.match.params.id).then(response => {
        if (response.status === 200) {
          setDeleteAlert(true);
        }
      });
    }
  };

  if (!_.isEmpty(formMappings) && !_.isEmpty(subjectType.uuid) && !firstTimeFormValueToggle && _.isEmpty(subjectType.registrationForm)) {
    setFirstTimeFormValueToggle(true);
    let payload = findRegistrationForm(formMappings, subjectType);
    dispatch({ type: "registrationForm", payload: payload });
  }

  const disableDelete = _.find(
    subjectTypes,
    ({ group, memberSubjectUUIDs }) => group && _.includes(memberSubjectUUIDs.split(","), subjectType.uuid)
  );

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Edit subject type "} />
        <Grid container item={12} style={{ justifyContent: "flex-end" }}>
          <Button color="primary" type="button" onClick={() => setRedirectShow(true)}>
            <VisibilityIcon /> Show
          </Button>
        </Grid>
        <div className="container" style={{ float: "left" }}>
          {subjectType.type === SubjectTypeType.User && (
            <div>
              <FormLabel style={{ fontSize: "13px" }}>Type</FormLabel>
              <br />
              <span style={{ fontSize: "15px" }}>{subjectType.type}</span>
            </div>
          )}
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
            isEdit={true}
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
        </div>
        <Grid container item sm={12}>
          <Grid item sm={1}>
            <SaveComponent name="save" onSubmit={onSubmit} styleClass={{ marginLeft: "14px" }} />
          </Grid>
          <Grid item sm={11}>
            <Button
              disabled={!_.isEmpty(disableDelete)}
              style={
                !_.isEmpty(disableDelete)
                  ? { float: "right" }
                  : {
                      float: "right",
                      color: "red"
                    }
              }
              onClick={() => onDelete()}
            >
              <DeleteIcon /> Delete
            </Button>
          </Grid>
        </Grid>
      </Box>
      {redirectShow && <Redirect to={`/appDesigner/subjectType/${props.match.params.id}/show`} />}
      {deleteAlert && <Redirect to="/appDesigner/subjectType" />}
    </>
  );
};

const mapStateToProps = state => ({
  organisationConfig: state.app.organisationConfig
});
export default withRouter(connect(mapStateToProps)(SubjectTypeEdit));
