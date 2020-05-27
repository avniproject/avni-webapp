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
import MenuItem from "@material-ui/core/MenuItem";
import _ from "lodash";
import {
  findEncounterCancellationForms,
  findEncounterForms,
  findProgramEncounterCancellationForms,
  findProgramEncounterForms
} from "../domain/formMapping";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniTextField } from "../../common/components/AvniTextField";
import { AvniSelect } from "../../common/components/AvniSelect";
import { AvniSelectForm } from "../../common/components/AvniSelectForm";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { sampleEncounterEligibilityCheckRule } from "../../formDesigner/common/SampleRule";

const EncounterTypeCreate = props => {
  const [encounterType, dispatch] = useReducer(encounterTypeReducer, encounterTypeInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [subjectValidation, setSubjectValidation] = useState(false);
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

    if (hasError) {
      return;
    }

    setNameValidation(false);
    setSubjectValidation(false);
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

  function getCancellationForms() {
    return _.isEmpty(programT)
      ? findEncounterCancellationForms(formList)
      : findProgramEncounterCancellationForms(formList);
  }

  function getEncounterForms() {
    return _.isEmpty(programT) ? findEncounterForms(formList) : findProgramEncounterForms(formList);
  }

  function resetValue(type) {
    dispatch({
      type,
      payload: null
    });
  }

  function updateProgram(program) {
    setProgramT(program);
    const formType = _.get(encounterType, "programEncounterForm.formType");
    const cancelFormType = _.get(encounterType, "programEncounterCancellationForm.formType");

    if (_.isEmpty(programT)) {
      if (formType === "ProgramEncounter") {
        resetValue("programEncounterForm");
      }
      if (cancelFormType === "ProgramEncounterCancellation") {
        resetValue("programEncounterCancellationForm");
      }
    } else {
      if (formType === "Encounter") {
        resetValue("programEncounterForm");
      }
      if (cancelFormType === "IndividualEncounterCancellation") {
        resetValue("programEncounterCancellationForm");
      }
    }
  }

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <DocumentationContainer filename={"EncounterType.md"}>
          <Title title={"Create Encounter Type"} />

          <div className="container">
            <form onSubmit={onSubmit}>
              <AvniTextField
                id="name"
                label="Name*"
                autoComplete="off"
                value={encounterType.name}
                onChange={event => dispatch({ type: "name", payload: event.target.value })}
                toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_NAME"}
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
              <AvniSelect
                label="Select subject type *"
                value={_.isEmpty(subjectT) ? "" : subjectT}
                onChange={event => setSubjectT(event.target.value)}
                style={{ width: "200px" }}
                required
                options={subjectType.map(option => (
                  <MenuItem value={option} key={option.uuid}>
                    {option.name}
                  </MenuItem>
                ))}
                toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_SUBJECT"}
              />
              <div />
              {subjectValidation && (
                <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                  Empty subject type is not allowed.
                </FormLabel>
              )}
              <p />
              <AvniSelect
                label="Select Program"
                value={_.isEmpty(programT) ? "" : programT}
                onChange={event => updateProgram(event.target.value)}
                style={{ width: "200px" }}
                required
                options={program.map(option => (
                  <MenuItem value={option} key={option.uuid}>
                    {option.name}
                  </MenuItem>
                ))}
                toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_PROGRAM"}
              />
              <div />
              <p />
              <AvniSelectForm
                label={"Select Encounter Form"}
                value={_.get(encounterType, "programEncounterForm.formName")}
                onChange={selectedForm =>
                  dispatch({
                    type: "programEncounterForm",
                    payload: selectedForm
                  })
                }
                formList={getEncounterForms()}
                toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_FORM"}
              />
              <p />
              <AvniSelectForm
                label={"Select Encounter Cancellation Form"}
                value={_.get(encounterType, "programEncounterCancellationForm.formName")}
                onChange={selectedForm =>
                  dispatch({
                    type: "programEncounterCancellationForm",
                    payload: selectedForm
                  })
                }
                formList={getCancellationForms()}
                toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_CANCELLATION_FORM"}
              />
              <p />
              <AvniFormLabel
                label={"Encounter Eligibility Check Rule"}
                toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_ELIGIBILITY_RULE"}
              />
              <Editor
                value={
                  encounterType.encounterEligibilityCheckRule ||
                  sampleEncounterEligibilityCheckRule()
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
        </DocumentationContainer>
      </Box>
      {alert && <Redirect to={"/appDesigner/encounterType/" + id + "/show"} />}
    </>
  );
};
export default EncounterTypeCreate;
