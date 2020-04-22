import TextField from "@material-ui/core/TextField";
import { Redirect } from "react-router-dom";
import React, { useState, useReducer, useEffect } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { programInitialState, colorPickerCSS } from "../Constant";
import { programReducer } from "../Reducers";
import ColorPicker from "material-ui-rc-color-picker";
import "material-ui-rc-color-picker/assets/index.css";
import { default as UUID } from "uuid";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import _ from "lodash";
import SelectForm from "../SubjectType/SelectForm";
import { findProgramEnrolmentForms, findProgramExitForms } from "../domain/formMapping";

const ProgramCreate = props => {
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [subjectValidation, setSubjectValidation] = useState(false);
  const [programEnrolmentFormValidation, setProgramEnrolmentFormValidation] = useState(false);
  const [programExitFormValidation, setProgramExitFormValidation] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(false);
  const [id, setId] = useState();
  const [subjectT, setSubjectT] = useState({});
  const [subjectType, setSubjectType] = useState([]);
  const [formMappings, setFormMappings] = useState([]);
  const [formList, setFormList] = useState([]);

  useEffect(() => {
    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        setFormMappings(formMap);
        setFormList(response.data.forms);
        setSubjectType(response.data.subjectTypes);
      })
      .catch(error => {});
  }, []);

  const onSubmit = event => {
    event.preventDefault();
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

    if (_.isEmpty(program.programEnrolmentForm)) {
      setProgramEnrolmentFormValidation(true);
      console.log("value is empty");
      hasError = true;
    }

    if (_.isEmpty(program.programExitForm)) {
      setProgramExitFormValidation(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setNameValidation(false);
    setSubjectValidation(false);
    setProgramEnrolmentFormValidation(false);
    setProgramExitFormValidation(false);

    setNameValidation(false);
    http
      .post("/web/program", {
        name: program.name,
        colour: program.colour === "" ? "#ff0000" : program.colour,
        programSubjectLabel: program.programSubjectLabel,
        enrolmentSummaryRule: program.enrolmentSummaryRule,
        subjectTypeUuid: subjectT.uuid,
        programEnrolmentFormUuid: _.get(program, "programEnrolmentForm.formUUID"),
        programExitFormUuid: _.get(program, "programExitForm.formUUID"),
        enrolmentEligibilityCheckRule: program.enrolmentEligibilityCheckRule
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
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Create program "} />

        <div className="container" style={{ float: "left" }}>
          <form onSubmit={onSubmit}>
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
            <FormControl>
              <InputLabel id="subjectType">Select subject type</InputLabel>
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
            {programEnrolmentFormValidation && (
              <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                Empty enrolment form is not allowed.
              </FormLabel>
            )}
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
            {programExitFormValidation && (
              <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                Empty exit form is not allowed.
              </FormLabel>
            )}
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

            <Button color="primary" variant="contained" type="submit">
              <i className="material-icons">save</i>Save
            </Button>
          </form>
        </div>
      </Box>
      {alert && <Redirect to={"/appDesigner/program/" + id + "/show"} />}
    </>
  );
};

export default ProgramCreate;
