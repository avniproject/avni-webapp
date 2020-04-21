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
import { ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import { get } from "lodash";
import { findProgramEnrolmentForm, findProgramExitForm } from "../domain/formMapping";

const ProgramShow = props => {
  const [program, setProgram] = useState({});
  const [editAlert, setEditAlert] = useState(false);
  const [formMappings, setFormMappings] = useState([]);
  const [subjectType, setSubjectType] = useState([]);

  useEffect(() => {
    http
      .get("/web/program/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setProgram(result);
      });

    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        setFormMappings(formMap);
        setSubjectType(response.data.subjectTypes);
      })
      .catch(error => {});
  }, []);

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Program: " + program.name} />
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
            <span style={{ fontSize: "15px" }}>{program.name}</span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Subject type</FormLabel>
            <br />
            <ShowSubjectType
              rowDetails={program}
              subjectType={subjectType}
              formMapping={formMappings}
              entityUUID="programUUID"
            />
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Colour</FormLabel>
            <br />
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "1px solid",
                background: program.colour
              }}
            >
              &nbsp;
            </div>
          </div>
          <p />

          <div>
            <FormLabel style={{ fontSize: "13px" }}>Program Subject Label</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{program.programSubjectLabel}</span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Enrolment form name</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <a
                href={`#/appdesigner/forms/${get(
                  findProgramEnrolmentForm(formMappings, program),
                  "formUUID"
                )}`}
              >
                {get(findProgramEnrolmentForm(formMappings, program), "formName")}
              </a>
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Exit form name</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <a
                href={`#/appdesigner/forms/${get(
                  findProgramExitForm(formMappings, program),
                  "formUUID"
                )}`}
              >
                {get(findProgramExitForm(formMappings, program), "formName")}
              </a>
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Organisation Id</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{program.organisationId}</span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Enrolment Summary Rule</FormLabel>
            <br />
            <Editor
              readOnly
              value={program.enrolmentSummaryRule ? program.enrolmentSummaryRule : ""}
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
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Enrolment Eligibility Check Rule</FormLabel>
            <br />
            <Editor
              readOnly
              value={
                program.enrolmentEligibilityCheckRule ? program.enrolmentEligibilityCheckRule : ""
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
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Created by</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{program.createdBy}</span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Last modified by</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{program.lastModifiedBy}</span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Created on(datetime)</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <Moment parse="YYYY-MM-DD HH:mm::ss">{program.createdDateTime}</Moment>
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Last modified on(datetime)</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <Moment parse="YYYY-MM-DD HH:mm::ss">{program.modifiedDateTime}</Moment>
            </span>
          </div>
        </div>

        {editAlert && <Redirect to={"/appDesigner/program/" + props.match.params.id} />}
      </Box>
    </>
  );
};

export default ProgramShow;
