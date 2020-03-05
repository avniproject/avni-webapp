import TextField from "@material-ui/core/TextField";
import { Redirect } from "react-router-dom";
import React, { useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";

const EncounterTypeCreate = props => {
  const [encounterTypeName, setEncounterTypeName] = useState("");
  const [encounterEligibilityCheckRule, setEncounterEligibilityCheckRule] = useState("");
  const [nameValidation, setNameValidation] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(false);
  const [id, setId] = useState();

  const onSubmit = event => {
    event.preventDefault();

    if (encounterTypeName === "") {
      setError("");
      setNameValidation(true);
    } else {
      setNameValidation(false);
      http
        .post("/web/encounterType", {
          name: encounterTypeName,
          encounterEligibilityCheckRule: encounterEligibilityCheckRule
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
        <Title title={"Create encounter type"} />

        <div className="container" style={{ float: "left" }}>
          <form onSubmit={onSubmit}>
            <TextField
              id="name"
              label="Name"
              autoComplete="off"
              value={encounterTypeName}
              onChange={event => setEncounterTypeName(event.target.value)}
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
            <FormLabel>Encounter Eligibility Check Rule</FormLabel>
            <Editor
              value={encounterEligibilityCheckRule ? encounterEligibilityCheckRule : ""}
              onValueChange={event => setEncounterEligibilityCheckRule(event)}
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
      {alert && <Redirect to={"/appDesigner/encounterType/" + id + "/show"} />}
    </>
  );
};

export default EncounterTypeCreate;
