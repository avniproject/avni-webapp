import TextField from "@material-ui/core/TextField";
import { Redirect } from "react-router-dom";
import React, { useState, useReducer } from "react";
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

const ProgramCreate = props => {
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(false);
  const [id, setId] = useState();

  const onSubmit = event => {
    event.preventDefault();

    if (program.name.trim() === "") {
      setError("");
      setNameValidation(true);
    } else {
      setNameValidation(false);
      http
        .post("/web/program", {
          name: program.name,
          colour: program.colour,
          programSubjectLabel: program.programSubjectLabel,
          enrolmentSummaryRule: program.enrolmentSummaryRule,
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
    }
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
