import TextField from "@material-ui/core/TextField";
import React, { useState, useEffect, useReducer } from "react";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { encounterTypeInitialState } from "../Constant";
import { encounterTypeReducer } from "../Reducers";
import { default as UUID } from "uuid";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import _ from "lodash";

const EncounterTypeEdit = props => {
  const [encounterType, dispatch] = useReducer(encounterTypeReducer, encounterTypeInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [error, setError] = useState("");
  const [redirectShow, setRedirectShow] = useState(false);
  const [encounterTypeData, setEncounterTypeData] = useState({});
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [subjectT, setSubjectT] = useState({});
  const [subjectType, setSubjectType] = useState([]);
  const [existMapping, setExistMapping] = useState([]);
  const [programT, setProgramT] = useState({});
  const [program, setProgram] = useState([]);
  const [formMapping, setMapping] = useState([]);
  const [subjectValidation, setSubjectValidation] = useState(false);

  useEffect(() => {
    http
      .get("/web/encounterType/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setEncounterTypeData(result);
        dispatch({ type: "setData", payload: result });
        http
          .get("/web/operationalModules")
          .then(response => {
            setMapping(response.data.formMappings);
            setSubjectType(response.data.subjectTypes);
            setProgram(response.data.programs);
            const temp = response.data.formMappings.filter(
              l => l.encounterTypeUUID === result.uuid
            );

            setSubjectT(
              response.data.subjectTypes.filter(l => l.uuid === temp[0].subjectTypeUUID)[0]
            );
            setProgramT(response.data.programs.filter(l => l.uuid === temp[0].programUUID)[0]);

            setExistMapping(temp);
            setSubjectT(
              response.data.subjectTypes.filter(l => l.uuid === temp[0].subjectTypeUUID)[0]
            );
          })
          .catch(error => {});
      });
  }, []);

  const onSubmit = () => {
    if (encounterType.name.trim() === "" || _.isEmpty(subjectT)) {
      setError("");
      encounterType.name.trim() === "" ? setNameValidation(true) : setNameValidation(false);
      _.isEmpty(subjectT) ? setSubjectValidation(true) : setSubjectValidation(false);
    } else {
      setNameValidation(false);
      setSubjectValidation(false);
      let temp =
        existMapping.length === 0
          ? [
              {
                uuid: UUID.v4(),
                subjectTypeUUID: subjectT.uuid,
                programUUID: programT === undefined ? null : programT.uuid,
                encounterTypeUUID: encounterTypeData.uuid,
                isVoided: false
              }
            ]
          : formMapping.filter(l => l.encounterTypeUUID === encounterTypeData.uuid);

      existMapping.length !== 0 &&
        temp.map(
          l => (
            (l.subjectTypeUUID = subjectT.uuid),
            (l.programUUID = programT === undefined ? null : programT.uuid),
            (l.isVoided = false)
          )
        );
      var promise = new Promise((resolve, reject) => {
        http
          .put("/web/encounterType/" + props.match.params.id, {
            name: encounterType.name,
            encounterEligibilityCheckRule: encounterType.encounterEligibilityCheckRule,
            id: props.match.params.id,
            organisationId: encounterTypeData.organisationId,
            encounterTypeOrganisationId: encounterTypeData.encounterTypeOrganisationId,
            voided: encounterTypeData.voided
          })
          .then(response => {
            if (response.status === 200) {
              setError("");
              resolve("Promise resolved ");
            }
          })
          .catch(error => {
            setError(error.response.data.message);
            reject(Error("Promise rejected"));
          });
      });
      promise.then(
        result => {
          http
            .post("/emptyFormMapping", temp)
            .then(response => {
              setRedirectShow(true);
            })
            .catch(error => {
              console.log(error.response.data.message);
            });
        },
        function(error) {
          console.log(error);
        }
      );
    }
  };

  const onDelete = () => {
    http
      .delete("/web/encounterType/" + props.match.params.id)
      .then(response => {
        if (response.status === 200) {
          setDeleteAlert(true);
        }
      })
      .catch(error => {});
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Edit encounter type "} />
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
            value={encounterType.name}
            onChange={event => dispatch({ type: "name", payload: event.target.value })}
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
          <FormControl>
            <InputLabel id="subjectType">Select subject type*</InputLabel>
            <Select
              label="Select subject type"
              value={_.isEmpty(subjectT) ? "" : subjectT}
              onChange={event => setSubjectT(event.target.value)}
              style={{ width: "200px" }}
              required
            >
              {subjectType.map(subject => {
                return (
                  <MenuItem value={subject} key={subject.uuid}>
                    {subject.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <div />
          {subjectValidation && (
            <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
              Empty subject type is not allowed.
            </FormLabel>
          )}
          <p />
          <FormControl>
            <InputLabel id="program">Select program</InputLabel>
            <Select
              label="Select program"
              value={_.isEmpty(programT) ? "" : programT}
              onChange={event => setProgramT(event.target.value)}
              style={{ width: "200px" }}
              required
            >
              {program.map(prog => {
                return (
                  <MenuItem value={prog} key={prog.uuid}>
                    {prog.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <p />
          <FormLabel>Enrolment eligibility check rule</FormLabel>
          <Editor
            value={
              encounterType.encounterEligibilityCheckRule
                ? encounterType.encounterEligibilityCheckRule
                : ""
            }
            onValueChange={event =>
              dispatch({ type: "encounterEligibilityCheckRule", payload: event })
            }
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
      {redirectShow && <Redirect to={`/appDesigner/encounterType/${props.match.params.id}/show`} />}
      {deleteAlert && <Redirect to="/appDesigner/encounterType" />}
    </>
  );
};

export default EncounterTypeEdit;
