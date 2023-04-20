import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import { programInitialState } from "../Constant";
import { programReducer } from "../Reducers";
import "material-ui-rc-color-picker/assets/index.css";
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

const ProgramEdit = ({ organisationConfig, ...props }) => {
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [errors, setErrors] = useState(new Map());
  const [redirectShow, setRedirectShow] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [subjectType, setSubjectType] = useState(null);
  const [formList, setFormList] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [{ rules, templates }, rulesDispatch] = useReducer(MessageReducer, {
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
        http
          .get("/web/operationalModules")
          .then(response => {
            const formMap = response.data.formMappings;
            formMap.map(l => (l["isVoided"] = false));
            setFormList(response.data.forms);
            setSubjectTypes(response.data.subjectTypes);
            const temp = response.data.formMappings.filter(l => l.programUUID === result.uuid);
            setSubjectType(
              response.data.subjectTypes.filter(l => l.uuid === temp[0].subjectTypeUUID)[0]
            );

            const enrolmentForm = findProgramEnrolmentForm(formMap, result);
            dispatch({ type: "programEnrolmentForm", payload: enrolmentForm });

            const exitForm = findProgramExitForm(formMap, result);
            dispatch({ type: "programExitForm", payload: exitForm });
          })
          .catch(error => {});
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
        setRedirectShow(saveResponse.status === 200);
      })
      .then(() => saveMessageRules(entityType, program.programId, rules));
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete program?")) {
      http
        .delete("/web/program/" + props.match.params.id)
        .then(response => {
          if (response.status === 200) {
            setDeleteAlert(true);
          }
        })
        .catch(error => {});
    }
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Edit Program "} />
        <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
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
          <AvniSwitch
            checked={program.active}
            onChange={event => dispatch({ type: "active", payload: event.target.checked })}
            name="Active"
            toolTipKey={"APP_DESIGNER_PROGRAM_ACTIVE"}
          />
          <br />
          {organisationConfig && organisationConfig.enableMessaging ? (
            <MessageRules
              rules={rules}
              templates={templates}
              onChange={onRulesChange}
              entityType={entityType}
              entityTypeId={program.programId}
            />
          ) : (
            <></>
          )}
          <br />
          <br />
        </div>

        <Grid container item sm={12}>
          <Grid item sm={1}>
            <SaveComponent name="save" onSubmit={onSubmit} styleClass={{ marginLeft: "14px" }} />
          </Grid>
          <Grid item sm={11}>
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
