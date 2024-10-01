import { Redirect, withRouter } from "react-router-dom";
import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import { programInitialState } from "../Constant";
import { programReducer } from "../Reducers";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import ProgramService from "../service/ProgramService";
import EditProgramFields from "./EditProgramFields";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import { getMessageTemplates, saveMessageRules } from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { identity } from "lodash";
import { connect } from "react-redux";
import Save from "@material-ui/icons/Save";

const ProgramCreate = ({ organisationConfig }) => {
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [errors, setErrors] = useState(new Map());
  const [saved, setSaved] = useState(false);
  const [id, setId] = useState();
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [subjectType, setSubjectType] = useState(null);
  const [formList, setFormList] = useState([]);
  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [],
    templates: []
  });

  const entityType = "ProgramEnrolment";

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  const onRulesChange = rules => {
    rulesDispatch({ type: "setRules", payload: rules });
  };

  useEffect(() => {
    dispatch({ type: "setLoaded" });
    http.get("/web/operationalModules").then(response => {
      setFormList(response.data.forms);
      setSubjectTypes(response.data.subjectTypes);
    });
  }, []);

  const onSubmit = event => {
    event.preventDefault();

    let [errors, jsCodeEECDR, jsCodeMEECDR] = ProgramService.validateProgram(program, subjectType);
    ProgramService.updateJSRules(program, errors, jsCodeEECDR, jsCodeMEECDR);
    if (errors.size !== 0) {
      setErrors(errors);
      return;
    }

    ProgramService.saveProgram(program, subjectType)
      .then(saveResponse => {
        setErrors(saveResponse.errors);
        setSaved(saveResponse.status === 200);
        if (saveResponse.errors.size === 0) setId(saveResponse.id);
        return saveResponse.programId;
      })
      .then(programId => {
        saveMessageRules(entityType, programId, rules);
      });
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <DocumentationContainer filename={"Program.md"}>
          <Title title={"Create Program "} />

          <div className="container" style={{ float: "left" }}>
            <form onSubmit={onSubmit}>
              <EditProgramFields
                program={program}
                errors={errors}
                formList={formList}
                subjectTypes={subjectTypes}
                dispatch={dispatch}
                onSubjectTypeChange={setSubjectType}
                subjectType={subjectType}
              />
              {organisationConfig && organisationConfig.enableMessaging ? (
                <MessageRules
                  templateFetchError={templateFetchError}
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
              <Button color="primary" variant="contained" type="submit" startIcon={<Save />}>
                Save
              </Button>
            </form>
          </div>
        </DocumentationContainer>
      </Box>
      {saved && <Redirect to={"/appDesigner/program/" + id + "/show"} />}
    </>
  );
};

const mapStateToProps = state => ({
  organisationConfig: state.app.organisationConfig
});
export default withRouter(connect(mapStateToProps)(ProgramCreate));
