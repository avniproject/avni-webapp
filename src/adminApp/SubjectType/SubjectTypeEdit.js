import TextField from "@material-ui/core/TextField";

import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import { subjectTypeInitialState } from "../Constant";
import { subjectTypeReducer } from "../Reducers";
import Switch from "@material-ui/core/Switch";
import GroupRoles from "./GroupRoles";
import { handleGroupChange, handleHouseholdChange, validateGroup } from "./GroupHandlers";

const SubjectTypeEdit = props => {
  const [subjectType, dispatch] = useReducer(subjectTypeReducer, subjectTypeInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [groupValidationError, setGroupValidationError] = useState(false);
  const [error, setError] = useState("");
  const [redirectShow, setRedirectShow] = useState(false);
  const [subjectTypeData, setSubjectTypeData] = useState({});
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [formMapping, setFormMapping] = useState([]);
  useEffect(() => {
    http
      .get("/web/subjectType/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setSubjectTypeData(result);
        dispatch({ type: "setData", payload: result });
      });
    http
      .get("/web/operationalModules")
      .then(response => {
        setFormMapping(response.data.formMappings);
      })
      .catch(error => {});
  }, []);

  const onSubmit = () => {
    validateGroup(subjectType.groupRoles, setGroupValidationError);
    if (subjectType.name.trim() === "") {
      setError("");
      setNameValidation(true);
    } else {
      setNameValidation(false);
      http
        .put("/web/subjectType/" + props.match.params.id, {
          name: subjectType.name,
          id: props.match.params.id,
          organisationId: subjectTypeData.organisationId,
          subjectTypeOrganisationId: subjectTypeData.subjectTypeOrganisationId,
          voided: subjectTypeData.voided,
          group: subjectType.group,
          household: subjectType.household,
          groupRoles: subjectType.groupRoles
        })
        .then(response => {
          if (response.status === 200) {
            setError("");
            setRedirectShow(true);
          }
        })
        .catch(error => {
          setError(error.response.data.message);
        });
    }
  };

  const onDelete = () => {
    const subjectTypeMapping = formMapping.filter(
      l => l.subjectTypeUUID === subjectTypeData.uuid && l.formUUID !== undefined
    );
    if (subjectTypeMapping.length === 0) {
      let removeAssociatedSubjectTypeMapping = formMapping.filter(
        l => l.subjectTypeUUID === subjectTypeData.uuid
      );

      if (window.confirm("Do you really want to delete subject type?")) {
        var promise = new Promise((resolve, reject) => {
          if (removeAssociatedSubjectTypeMapping.length === 0) {
            resolve("Promise resolved ");
          } else {
            removeAssociatedSubjectTypeMapping.forEach(l => (l["isVoided"] = true));
            http
              .post("/emptyFormMapping", removeAssociatedSubjectTypeMapping)
              .then(response => {
                resolve("Promise resolved ");
              })
              .catch(error => {
                console.log(error.response.data.message);
                reject(Error("Promise rejected"));
              });
          }
        });

        promise.then(result => {
          http
            .delete("/web/subjectType/" + props.match.params.id)
            .then(response => {
              if (response.status === 200) {
                setDeleteAlert(true);
              }
            })
            .catch(error => {});
        });
      }
    } else {
      alert("Please remove associated forms with this subject type.");
    }
  };

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
          <Grid component="label" container alignItems="center" spacing={2}>
            <Grid>Group</Grid>
            <Grid>
              <Switch
                checked={subjectType.group}
                onChange={event => handleGroupChange(event, subjectType, dispatch)}
                name="group"
              />
            </Grid>
          </Grid>
          <p />
          {subjectType.group && (
            <>
              <Grid component="label" container alignItems="center" spacing={2}>
                <Grid>Group Roles</Grid>
              </Grid>
              <GroupRoles
                groupRoles={subjectType.groupRoles}
                household={subjectType.household}
                dispatch={dispatch}
                error={groupValidationError}
                edit={true}
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
        </div>
        <Grid container item sm={12}>
          <Grid item sm={1}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => onSubmit()}
              style={{ marginLeft: "14px" }}
            >
              <i className="material-icons">save</i>Save
            </Button>
          </Grid>
          <Grid item sm={11}>
            <Button style={{ float: "right", color: "red" }} onClick={() => onDelete()}>
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

export default SubjectTypeEdit;
