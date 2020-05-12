import { Redirect } from "react-router-dom";
import React, { useReducer, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import { subjectTypeInitialState } from "../Constant";
import { subjectTypeReducer } from "../Reducers";
import { Grid } from "@material-ui/core";
import GroupRoles from "./GroupRoles";
import { handleGroupChange, handleHouseholdChange, validateGroup } from "./GroupHandlers";
import { useFormMappings } from "./effects";
import _ from "lodash";
import { findRegistrationForms } from "../domain/formMapping";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniTextField } from "../../common/components/AvniTextField";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { AvniSelectForm } from "../../common/components/AvniSelectForm";

const SubjectTypeCreate = props => {
  const [subjectType, dispatch] = useReducer(subjectTypeReducer, subjectTypeInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [groupValidationError, setGroupValidationError] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(false);
  const [id, setId] = useState();
  const [formMappings, setFormMappings] = useState([]);
  const [formList, setFormList] = useState([]);
  const [age, setAge] = useState();

  const consumeFormMappingResult = (formMap, forms) => {
    setFormMappings(formMap);
    setFormList(forms);
  };

  useFormMappings(consumeFormMappingResult);

  const onSubmit = event => {
    event.preventDefault();

    validateGroup(subjectType.groupRoles, setGroupValidationError);
    if (subjectType.name.trim() === "") {
      setError("");
      setNameValidation(true);
      return;
    }

    setNameValidation(false);
    let subjectTypeUuid;

    let subjectTypeSavePromise = () =>
      http
        .post("/web/subjectType", {
          ...subjectType,
          registrationFormUuid: _.get(subjectType, "registrationForm.formUUID")
        })
        .then(response => {
          if (response.status === 200) {
            subjectTypeUuid = response.data.uuid;
            setError("");
            setAlert(true);
            setId(response.data.id);
          }
        })
        .catch(error => {
          setError(error.response.data.message);
        });

    return subjectTypeSavePromise();
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
              <AvniSwitch
                checked={subjectType.household}
                onChange={event => handleHouseholdChange(event, subjectType, dispatch)}
                name="Household"
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_HOUSEHOLD"}
              />
              <p />
              <AvniSwitch
                disabled={subjectType.household}
                checked={subjectType.group}
                onChange={event => handleGroupChange(event, subjectType, dispatch)}
                name="Group"
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_GROUP"}
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
              {!subjectType.household && subjectType.group && (
                <>
                  <Grid component="label" container alignItems="center" spacing={2}>
                    <Grid>Group Roles</Grid>
                  </Grid>
                  <GroupRoles
                    groupRoles={subjectType.groupRoles}
                    household={subjectType.household}
                    dispatch={dispatch}
                    error={groupValidationError}
                  />
                </>
              )}
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
