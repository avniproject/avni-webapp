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
import { programInitialState, colorPickerCSS } from "../Constant";
import { programReducer } from "../Reducers";
import ColorPicker from "material-ui-rc-color-picker";
import "material-ui-rc-color-picker/assets/index.css";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import _ from "lodash";
import { default as UUID } from "uuid";
import {
  findProgramEncounterCancellationForm,
  findProgramEncounterForm,
  findProgramEncounterForms,
  findProgramEnrolmentForm,
  findProgramEnrolmentForms,
  findProgramExitForm,
  findProgramExitForms
} from "../domain/formMapping";
import SelectForm from "../SubjectType/SelectForm";

const ProgramEdit = props => {
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [subjectValidation, setSubjectValidation] = useState(false);
  const [error, setError] = useState("");
  const [redirectShow, setRedirectShow] = useState(false);
  const [programData, setProgramData] = useState({});
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [subjectT, setSubjectT] = useState({});
  const [formMappings, setFormMappings] = useState([]);
  const [formList, setFormList] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [existMapping, setExistMapping] = useState([]);

  useEffect(() => {
    http
      .get("/web/program/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setProgramData(result);
        dispatch({ type: "setData", payload: result });
        http
          .get("/web/operationalModules")
          .then(response => {
            const formMap = response.data.formMappings;
            formMap.map(l => (l["isVoided"] = false));
            setFormMappings(formMap);
            setFormList(response.data.forms);
            setSubjectType(response.data.subjectTypes);
            const temp = response.data.formMappings.filter(l => l.programUUID === result.uuid);
            setExistMapping(temp);
            setSubjectT(
              response.data.subjectTypes.filter(l => l.uuid === temp[0].subjectTypeUUID)[0]
            );

            const enrolmentForm = findProgramEnrolmentForm(formMap, result);
            dispatch({ type: "programEnrolmentForm", payload: enrolmentForm });

            const exitForm = findProgramExitForm(formMap, result);
            dispatch({ type: "programExitForm", payload: exitForm });
          })
          .catch(error => {});
      });
  }, []);

  const onSubmit = () => {
    let hasError = false;

    if (program.name.trim() === "") {
      setError("");
      setNameValidation(true);
      hasError = true;
    }

    if (_.isEmpty(subjectT)) {
      setError("");
      setSubjectValidation(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setNameValidation(false);
    setSubjectValidation(false);

    http
      .put("/web/program/" + props.match.params.id, {
        name: program.name,
        colour: program.colour === "" ? "#ff0000" : program.colour,
        programSubjectLabel: program.programSubjectLabel,
        enrolmentSummaryRule: program.enrolmentSummaryRule,
        enrolmentEligibilityCheckRule: program.enrolmentEligibilityCheckRule,
        id: props.match.params.id,
        organisationId: programData.organisationId,
        programOrganisationId: programData.programOrganisationId,
        subjectTypeUuid: subjectT.uuid,
        programEnrolmentFormUuid: _.get(program, "programEnrolmentForm.formUUID"),
        programExitFormUuid: _.get(program, "programExitForm.formUUID"),
        voided: programData.voided
      })
      .then(response => {
        setError("");
        setRedirectShow(true);
      })
      .catch(error => {
        setError("error.response.data.message");
      });
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete program?")) {
      http
        .delete("/web/program/" + props.match.params.id)
        .then(response => {
          if (response.status === 200) {
            setDeleteAlert(true);
          }
        })
        .catch(error => {});
    }
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Edit program "} />
        <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
          <Button color="primary" type="button" onClick={() => setRedirectShow(true)}>
            <VisibilityIcon /> Show
          </Button>
        </Grid>
        <div className="container" style={{ float: "left" }}>
          <TextField
            id="name"
            label="Name"
            autoComplete="off"
            value={program.name}
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
          <p />
          <FormControl>
            <InputLabel id="subjectType">Select subject type</InputLabel>
            <Select
              label="Select subject type"
              value={subjectT}
              onChange={event => setSubjectT(event.target.value)}
              style={{ width: "200px" }}
            >
              {subjectType.map(subject => {
                return (
                  <MenuItem value={subject} key={subject.name}>
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
          <FormLabel>Colour picker</FormLabel>
          <br />
          <ColorPicker
            id="colour"
            label="Colour"
            style={colorPickerCSS}
            color={program.colour}
            onChange={color => dispatch({ type: "colour", payload: color.color })}
          />
          <br />
          <TextField
            id="programsubjectlabel"
            label="Program subject label"
            autoComplete="off"
            value={program.programSubjectLabel}
            onChange={event =>
              dispatch({ type: "programSubjectLabel", payload: event.target.value })
            }
          />
          <p />
          <FormControl>
            <SelectForm
              label={"Select Enrolment form"}
              value={_.get(program, "programEnrolmentForm.formName")}
              onChange={selectedForm =>
                dispatch({
                  type: "programEnrolmentForm",
                  payload: selectedForm
                })
              }
              formList={findProgramEnrolmentForms(formList)}
            />
          </FormControl>
          <p />
          <FormControl>
            <SelectForm
              label={"Select Exit form"}
              value={_.get(program, "programExitForm.formName")}
              onChange={selectedForm =>
                dispatch({
                  type: "programExitForm",
                  payload: selectedForm
                })
              }
              formList={findProgramExitForms(formList)}
            />
          </FormControl>
          <p />
          <FormLabel>Enrolment summary rule</FormLabel>
          <Editor
            value={program.enrolmentSummaryRule ? program.enrolmentSummaryRule : ""}
            onValueChange={event => dispatch({ type: "enrolmentSummaryRule", payload: event })}
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
          <FormLabel>Enrolment eligibility check rule</FormLabel>
          <Editor
            value={
              program.enrolmentEligibilityCheckRule ? program.enrolmentEligibilityCheckRule : ""
            }
            onValueChange={event =>
              dispatch({ type: "enrolmentEligibilityCheckRule", payload: event })
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
      {redirectShow && <Redirect to={`/appDesigner/program/${props.match.params.id}/show`} />}
      {deleteAlert && <Redirect to="/appDesigner/program" />}
    </>
  );
};

export default ProgramEdit;
