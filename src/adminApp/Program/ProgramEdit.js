import TextField from "@material-ui/core/TextField";

import React, { useState, useEffect } from "react";
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

const ProgramEdit = props => {
  const [programName, setProgramName] = useState("");
  const [programColour, setProgramColour] = useState("");
  const [programSubjectLabel, setProgramSubjectLabel] = useState("");
  const [enrolmentSummaryRule, setEnrolmentSummaryRule] = useState("");
  const [enrolmentEligibilityCheckRule, setEnrolmentEligibilityCheckRule] = useState("");
  const [nameValidation, setNameValidation] = useState(false);
  const [error, setError] = useState("");
  const [redirectShow, setRedirectShow] = useState(false);
  const [program, setProgram] = useState({});
  const [deleteAlert, setDeleteAlert] = useState(false);

  useEffect(() => {
    http
      .get("/web/program/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setProgram(result);
        setProgramName(result.name);
        setProgramColour(result.colour);
        setProgramSubjectLabel(result.programSubjectLabel);
        setEnrolmentSummaryRule(result.enrolmentSummaryRule);
        setEnrolmentEligibilityCheckRule(result.enrolmentEligibilityCheckRule);
      });
  }, []);

  const onSubmit = () => {
    if (programName === "") {
      setError("");
      setNameValidation(true);
    } else {
      setNameValidation(false);
      http
        .put("/web/program/" + props.match.params.id, {
          name: programName,
          colour: programColour,
          programSubjectLabel: programSubjectLabel,
          enrolmentSummaryRule: enrolmentSummaryRule,
          enrolmentEligibilityCheckRule: enrolmentEligibilityCheckRule,
          id: props.match.params.id,
          organisationId: program.organisationId,
          programOrganisationId: program.programOrganisationId,
          voided: program.voided
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
    http
      .delete("/web/program/" + props.match.params.id)
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
        <Title title={"Edit program "} />
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
            value={programName}
            onChange={event => setProgramName(event.target.value)}
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
          <TextField
            id="colour"
            label="Colour"
            autoComplete="off"
            value={programColour}
            onChange={event => setProgramColour(event.target.value)}
          />
          <p />
          <TextField
            id="programsubjectlabel"
            label="Program subject label"
            autoComplete="off"
            value={programSubjectLabel}
            onChange={event => setProgramSubjectLabel(event.target.value)}
          />
          <p />
          <FormLabel>Enrolment summary rule</FormLabel>
          <Editor
            value={enrolmentSummaryRule ? enrolmentSummaryRule : ""}
            onValueChange={event => setEnrolmentSummaryRule(event)}
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
            value={enrolmentEligibilityCheckRule ? enrolmentEligibilityCheckRule : ""}
            onValueChange={event => setEnrolmentEligibilityCheckRule(event)}
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
      {redirectShow && <Redirect to={`/admin/program/${props.match.params.id}/show`} />}
      {deleteAlert && <Redirect to="/admin/program" />}
    </>
  );
};

export default ProgramEdit;
