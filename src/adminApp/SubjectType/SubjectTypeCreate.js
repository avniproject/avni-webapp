import TextField from "@material-ui/core/TextField";
import { Redirect } from "react-router-dom";
import React, { useReducer, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import { subjectTypeInitialState } from "../Constant";
import { subjectTypeReducer } from "../Reducers";
import Switch from "@material-ui/core/Switch";
import { Grid } from "@material-ui/core";
import GroupRoles from "./GroupRoles";
import { handleHouseholdChange, validateGroup } from "./GroupHandlers";
import { useFormMappings } from "./effects";
import _ from "lodash";
import { findRegistrationForms } from "../domain/formMapping";
import SelectForm from "./SelectForm";

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
        <Title title={"Create subject type "} />

        <div className="container" style={{ float: "left" }}>
          <form onSubmit={onSubmit}>
            <TextField
              id="name"
              label="Name"
              autoComplete="off"
              value={subjectType.name}
              onChange={event => dispatch({ type: "name", payload: event.target.value })}
            />
            <p />
            <Grid component="label" container alignItems="center" spacing={2}>
              <Grid>Household</Grid>
              <Grid>
                <Switch
                  checked={subjectType.household}
                  onChange={event => handleHouseholdChange(event, subjectType, dispatch)}
                  name="household"
                />
              </Grid>
            </Grid>
            <p />
            <SelectForm
              label={"Registration form name"}
              value={_.get(subjectType, "registrationForm.formName")}
              onChange={selectedForm =>
                dispatch({
                  type: "registrationForm",
                  payload: selectedForm
                })
              }
              formList={findRegistrationForms(formList)}
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
      </Box>
      {alert && <Redirect to={"/appDesigner/subjectType/" + id + "/show"} />}
    </>
  );
};

export default SubjectTypeCreate;
