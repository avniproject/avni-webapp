import React, { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { programInitialState } from "../Constant";
import { programReducer } from "../Reducers";
import { findProgramEnrolmentForm, findProgramExitForm } from "../domain/formMapping";
import { SaveComponent } from "../../common/components/SaveComponent";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import ProgramService from "../service/ProgramService";
import EditProgramFields from "./EditProgramFields";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import { getMessageRules, getMessageTemplates, saveMessageRules } from "../service/MessageService";
import { identity } from "lodash";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { connect } from "react-redux";
import { getDBValidationError } from "../../formDesigner/common/ErrorUtil";

const ProgramEdit = ({ organisationConfig, ...props }) => {
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [errors, setErrors] = useState(new Map());
  const [msgError, setMsgError] = useState("");
  const [redirectShow, setRedirectShow] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [subjectType, setSubjectType] = useState(null);
  const [formList, setFormList] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [],
    templates: []
  });
  const entityType = "ProgramEnrolment";
  useEffect(() => {
    getMessageRules(entityType, program.programId, rulesDispatch);
    return identity;
  }, [program]);

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  const onRulesChange = rules => {
    rulesDispatch({ type: "setRules", payload: rules });
  };

  useEffect(() => {
    http
      .get("/web/program/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        dispatch({ type: "setData", payload: result });
        http.get("/web/operationalModules").then(response => {
          const formMap = response.data.formMappings;
          formMap.map(l => (l["isVoided"] = false));
          setFormList(response.data.forms);
          setSubjectTypes(response.data.subjectTypes);
          const temp = response.data.formMappings.filter(l => l.programUUID === result.uuid);
          setSubjectType(response.data.subjectTypes.filter(l => l.uuid === temp[0].subjectTypeUUID)[0]);

          const enrolmentForm = findProgramEnrolmentForm(formMap, result);
          dispatch({ type: "programEnrolmentForm", payload: enrolmentForm });

          const exitForm = findProgramExitForm(formMap, result);
          dispatch({ type: "programExitForm", payload: exitForm });
        });
      });
  }, []);

  const onSubmit = () => {
    let [errors, jsCodeEECDR, jsCodeMEECDR] = ProgramService.validateProgram(program, subjectType);
    ProgramService.updateJSRules(program, errors, jsCodeEECDR, jsCodeMEECDR);

    if (errors.size !== 0) {
      setErrors(errors);
      return;
    }

    return ProgramService.saveProgram(program, subjectType, props.match.params.id)
      .then(saveResponse => {
        setErrors(saveResponse.errors);
        if (saveResponse.errors.size === 0) {
          setMsgError("");
        }
      })
      .then(() => saveMessageRules(entityType, program.programId, rules))
      .then(() => setRedirectShow(true))
      .catch(error => {
        !error.response.data.message && setMsgError(getDBValidationError(error));
      });
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete program?")) {
      http.delete("/web/program/" + props.match.params.id).then(response => {
        if (response.status === 200) {
          setDeleteAlert(true);
        }
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper"
        }}
      >
        <Title title={"Edit Program "} />
        <Grid
          container
          style={{ justifyContent: "flex-end" }}
          size={{
            sm: 12
          }}
        >
          <Button color="primary" type="button" onClick={() => setRedirectShow(true)}>
            <VisibilityIcon /> Show
          </Button>
        </Grid>
        <div className="container" style={{ float: "left" }}>
          {program.loaded && (
            <EditProgramFields
              program={program}
              errors={errors}
              subjectTypes={subjectTypes}
              formList={formList}
              dispatch={dispatch}
              onSubjectTypeChange={setSubjectType}
              subjectType={subjectType}
            />
          )}
          <br />
          {program.loaded && (
            <AvniSwitch
              checked={program.active}
              onChange={event => dispatch({ type: "active", payload: event.target.checked })}
              name="Active"
              toolTipKey={"APP_DESIGNER_PROGRAM_ACTIVE"}
            />
          )}
          <br />
          {organisationConfig && organisationConfig.enableMessaging ? (
            <MessageRules
              templateFetchError={templateFetchError}
              rules={rules}
              templates={templates}
              onChange={onRulesChange}
              entityType={entityType}
              entityTypeId={program.programId}
              msgError={msgError}
            />
          ) : (
            <></>
          )}
          <br />
          <br />
        </div>
        <Grid
          container
          size={{
            sm: 12
          }}
        >
          <Grid
            size={{
              sm: 1
            }}
          >
            <SaveComponent name="save" onSubmit={onSubmit} styleClass={{ marginLeft: "14px" }} />
          </Grid>
          <Grid
            size={{
              sm: 11
            }}
          >
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
const mapStateToProps = state => ({
  organisationConfig: state.app.organisationConfig
});
export default withRouter(connect(mapStateToProps)(ProgramEdit));
