import React, { useState, useEffect } from "react";
import EditIcon from "@material-ui/icons/Edit";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import Moment from "react-moment";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
import _, { get } from "lodash";
import { GroupRoleShow } from "./GroupRoleShow";
import { findRegistrationForm } from "../domain/formMapping";
import { useFormMappings } from "./effects";
import RemoveIcon from "@material-ui/icons/Remove";
import CheckIcon from "@material-ui/icons/Check";
import { ActiveStatusInShow } from "../../common/components/ActiveStatus";
import { Audit } from "../../formDesigner/components/Audit";

const SubjectTypeShow = props => {
  const [subjectType, setSubjectType] = useState({});
  const [editAlert, setEditAlert] = useState(false);
  const [formMappings, setFormMappings] = useState([]);

  useFormMappings(setFormMappings);
  useEffect(() => {
    http
      .get("/web/subjectType/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setSubjectType(result);
      });
  }, []);

  return (
    !_.isEmpty(subjectType) && (
      <>
        <Box boxShadow={2} p={3} bgcolor="background.paper">
          <Title title={"Subject Type: " + subjectType.name} />
          <Grid container item={12} style={{ justifyContent: "flex-end" }}>
            <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
              <EditIcon />
              Edit
            </Button>
          </Grid>
          <div className="container" style={{ float: "left" }}>
            <div>
              <FormLabel style={{ fontSize: "13px" }}>Name</FormLabel>
              <br />
              <span style={{ fontSize: "15px" }}>{subjectType.name}</span>
            </div>
            <p />
            <div>
              <FormLabel style={{ fontSize: "13px" }}>Household</FormLabel>
              <br />

              {subjectType.household ? <CheckIcon /> : <RemoveIcon />}
            </div>
            <p />
            <div>
              <FormLabel style={{ fontSize: "13px" }}>Group</FormLabel>
              <br />

              {subjectType.group ? <CheckIcon /> : <RemoveIcon />}
            </div>
            <p />
            <ActiveStatusInShow status={subjectType.active} />
            <div>
              <FormLabel style={{ fontSize: "13px" }}>Registration Form</FormLabel>
              <br />
              <span style={{ fontSize: "15px" }}>
                <a
                  href={`#/appdesigner/forms/${get(
                    findRegistrationForm(formMappings, subjectType),
                    "formUUID"
                  )}`}
                >
                  {get(findRegistrationForm(formMappings, subjectType), "formName")}
                </a>
              </span>
            </div>
            <p />
            <div>
              <FormLabel style={{ fontSize: "13px" }}>Organisation Id</FormLabel>
              <br />
              <span style={{ fontSize: "15px" }}>{subjectType.organisationId}</span>
            </div>
            <p />
            {subjectType.group && <GroupRoleShow groupRoles={subjectType.groupRoles} />}
            <Audit {...subjectType} />
          </div>
          {editAlert && <Redirect to={"/appDesigner/subjectType/" + props.match.params.id} />}
        </Box>
      </>
    )
  );
};

export default SubjectTypeShow;
