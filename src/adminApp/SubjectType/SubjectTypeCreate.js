import { Redirect } from "react-router-dom";
import React, { useReducer, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import { subjectTypeInitialState } from "../Constant";
import { subjectTypeReducer } from "../Reducers";
import GroupRoles from "./GroupRoles";
import { validateGroup } from "./GroupHandlers";
import { useFormMappings, useLocationType } from "./effects";
import _ from "lodash";
import { findRegistrationForms } from "../domain/formMapping";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniTextField } from "../../common/components/AvniTextField";
import { AvniSelectForm } from "../../common/components/AvniSelectForm";
import { AvniSelect } from "../../common/components/AvniSelect";
import MenuItem from "@material-ui/core/MenuItem";
import Types from "./Types";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import Editor from "react-simple-code-editor";
import { sampleSubjectSummaryRule } from "../../formDesigner/common/SampleRule";
import { highlight, languages } from "prismjs/components/prism-core";
import { AdvancedSettings } from "./AdvancedSettings";
import { AvniImageUpload } from "../../common/components/AvniImageUpload";
import { bucketName, uploadImage } from "../../common/utils/S3Client";

const SubjectTypeCreate = () => {
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
            }
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
              <AvniTextField
                id="name"
                label="Name"
                autoComplete="off"
                value={subjectType.name}
                onChange={event => dispatch({ type: "name", payload: event.target.value })}
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_NAME"}
              />
              <p />
              <AvniSelect
                label="Select Type *"
                value={_.isEmpty(subjectType.type) ? "" : subjectType.type}
                onChange={event => dispatch({ type: "type", payload: event.target.value })}
                style={{ width: "200px" }}
                required
                options={Types.types.map(({ type }, index) => (
                  <MenuItem value={type} key={index}>
                    {type}
                  </MenuItem>
                ))}
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_SELECT_TYPE"}
              />
              <p />
              <AvniImageUpload
                onSelect={setFile}
                label={"Icon"}
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_ICON"}
                width={75}
                height={75}
                oldImgUrl={subjectType.iconFileS3Key}
                allowUpload={true}
                onDelete={() => setRemoveFile(true)}
                displayDelete={true}
              />
              <p />
              <AvniSelectForm
                label={"Registration Form"}
                value={_.get(subjectType, "registrationForm.formName")}
                onChange={selectedForm =>
                  dispatch({
                    type: "registrationForm",
                    payload: selectedForm
                  })
                }
                formList={findRegistrationForms(formList)}
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_SELECT_FORM"}
              />
              <p />
              {Types.isGroup(subjectType.type) && (
                <>
                  <AvniFormLabel
                    label={Types.isHousehold(subjectType.type) ? "Household Roles" : "Group Roles"}
                    toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_GROUP_ROLES"}
                  />
                  <GroupRoles
                    groupRoles={subjectType.groupRoles}
                    type={subjectType.type}
                    dispatch={dispatch}
                    error={groupValidationError}
                    memberSubjectType={subjectType.memberSubjectType}
                  />
                </>
              )}
              <p />
              <AvniFormLabel label={"Subject Summary Rule"} toolTipKey={"SUBJECT_SUMMARY_RULE"} />
              <Editor
                value={subjectType.subjectSummaryRule || sampleSubjectSummaryRule()}
                onValueChange={event => dispatch({ type: "subjectSummaryRule", payload: event })}
                highlight={code => highlight(code, languages.js)}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 15,
                  height: "auto",
                  borderStyle: "solid",
                  borderWidth: "1px"
                }}
              />
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
              <Button color="primary" variant="contained" type="submit">
                <i className="material-icons">save</i>Save
              </Button>
            </form>
          </div>
        </DocumentationContainer>
      </Box>
      {alert && <Redirect to={"/appDesigner/subjectType/" + id + "/show"} />}
    </>
  );
};

export default SubjectTypeCreate;
