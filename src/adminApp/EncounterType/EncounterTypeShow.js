import React, { useEffect, useState } from "react";
import EditIcon from "@material-ui/icons/Edit";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import Moment from "react-moment";
import Grid from "@material-ui/core/Grid";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { ShowPrograms, ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import { get } from "lodash";
import {
  findProgramEncounterCancellationForm,
  findProgramEncounterForm
} from "../domain/formMapping";
import { ActiveStatusInShow } from "../../common/components/ActiveStatus";
import { Audit } from "../../formDesigner/components/Audit";

const EncounterTypeShow = props => {
  const [encounterType, setEncounterType] = useState({});
  const [editAlert, setEditAlert] = useState(false);
  const [formMappings, setFormMappings] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [program, setProgram] = useState([]);

  useEffect(() => {
    http
      .get("/web/encounterType/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setEncounterType(result);
      });

    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        setFormMappings(formMap);
        setSubjectType(response.data.subjectTypes);
        setProgram(response.data.programs);
      })
      .catch(error => {});
  }, []);

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Encounter Type : " + encounterType.name} />
        <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
          <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
            <EditIcon />
            Edit
          </Button>
        </Grid>
        <div className="container" style={{ float: "left" }}>
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Name</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{encounterType.name}</span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Subject Type</FormLabel>
            <br />
            <ShowSubjectType
              rowDetails={encounterType}
              subjectType={subjectType}
              formMapping={formMappings}
              entityUUID="encounterTypeUUID"
            />
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Program</FormLabel>
            <br />
            <ShowPrograms
              rowDetails={encounterType}
              program={program}
              formMapping={formMappings}
              setMapping={setFormMappings}
            />
          </div>
          <p />
          <ActiveStatusInShow status={encounterType.active} />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Encounter Form</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <a
                href={`#/appdesigner/forms/${get(
                  findProgramEncounterForm(formMappings, encounterType),
                  "formUUID"
                )}`}
              >
                {get(findProgramEncounterForm(formMappings, encounterType), "formName")}
              </a>
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Encounter Cancellation Form</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <a
                href={`#/appdesigner/forms/${get(
                  findProgramEncounterCancellationForm(formMappings, encounterType),
                  "formUUID"
                )}`}
              >
                {get(findProgramEncounterCancellationForm(formMappings, encounterType), "formName")}
              </a>
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Organisation Id</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{encounterType.organisationId}</span>
          </div>
          <p />

          <div>
            <FormLabel style={{ fontSize: "13px" }}>Encounter Eligibility Check Rule</FormLabel>
            <br />
            <Editor
              readOnly
              value={
                encounterType.encounterEligibilityCheckRule
                  ? encounterType.encounterEligibilityCheckRule
                  : ""
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
          </div>
          <p />
          <Audit {...encounterType} />
        </div>

        {editAlert && <Redirect to={"/appDesigner/encounterType/" + props.match.params.id} />}
      </Box>
    </>
  );
};

export default EncounterTypeShow;
