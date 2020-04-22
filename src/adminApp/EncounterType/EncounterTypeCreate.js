import TextField from "@material-ui/core/TextField";
import { Redirect } from "react-router-dom";
import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { encounterTypeInitialState } from "../Constant";
import { encounterTypeReducer } from "../Reducers";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import _ from "lodash";
import SelectForm from "../SubjectType/SelectForm";
import {
  findProgramEncounterCancellationForms,
  findProgramEncounterForms
} from "../domain/formMapping";

const EncounterTypeCreate = props => {
  const [encounterType, dispatch] = useReducer(encounterTypeReducer, encounterTypeInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [subjectValidation, setSubjectValidation] = useState(false);
  const [programEncounterFormValidation, setProgramEncounterFormValidation] = useState(false);
  const [
    programEncounterCancellationFormValidation,
    setProgramEncounterCancellationFormValidation
  ] = useState(false);
  const [subjectT, setSubjectT] = useState({});
  const [subjectType, setSubjectType] = useState([]);
  const [programT, setProgramT] = useState({});
  const [program, setProgram] = useState([]);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(false);
  const [id, setId] = useState();
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
        setProgram(response.data.programs);
      })
      .catch(error => {});
  }, []);

  const onSubmit = event => {
    event.preventDefault();
    let hasError = false;
    if (encounterType.name.trim() === "") {
      setNameValidation(true);
      hasError = true;
    }

    if (_.isEmpty(subjectT)) {
      setSubjectValidation(true);
      hasError = true;
    }

    if (_.isEmpty(encounterType.programEncounterForm)) {
      setProgramEncounterFormValidation(true);
      console.log("value is empty");
      hasError = true;
    }

    if (_.isEmpty(encounterType.programEncounterCancellationForm)) {
      setProgramEncounterCancellationFormValidation(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setNameValidation(false);
    setSubjectValidation(false);
    setProgramEncounterFormValidation(false);
    setProgramEncounterCancellationFormValidation(false);
    http
      .post("/web/encounterType", {
        name: encounterType.name,
        encounterEligibilityCheckRule: encounterType.encounterEligibilityCheckRule,
        subjectTypeUuid: subjectT.uuid,
        programEncounterFormUuid: _.get(encounterType, "programEncounterForm.formUUID"),
        programEncounterCancelFormUuid: _.get(
          encounterType,
          "programEncounterCancellationForm.formUUID"
        ),
        programUuid: _.get(programT, "uuid")
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
        <Title title={"Create encounter type"} />

        <div className="container" style={{ float: "left" }}>
          <form onSubmit={onSubmit}>
            <TextField
              id="name"
              label="Name*"
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
            <FormControl>
              <SelectForm
                label={"Select Encounter form"}
                value={_.get(encounterType, "programEncounterForm.formName")}
                onChange={selectedForm =>
                  dispatch({
                    type: "programEncounterForm",
                    payload: selectedForm
                  })
                }
                formList={findProgramEncounterForms(formList)}
              />
            </FormControl>
            {programEncounterFormValidation && (
              <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                Empty encounter form is not allowed.
              </FormLabel>
            )}
            <p />
            <FormControl>
              <SelectForm
                label={"Select Encounter cancellation form"}
                value={_.get(encounterType, "programEncounterCancellationForm.formName")}
                onChange={selectedForm =>
                  dispatch({
                    type: "programEncounterCancellationForm",
                    payload: selectedForm
                  })
                }
                formList={findProgramEncounterCancellationForms(formList)}
              />
            </FormControl>
            {programEncounterCancellationFormValidation && (
              <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                Empty encounter cancellation form is not allowed.
              </FormLabel>
            )}
            <p />
            <FormLabel>Encounter Eligibility Check Rule</FormLabel>
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
