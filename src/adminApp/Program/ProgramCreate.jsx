import { useNavigate } from "react-router-dom";
import { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { SaveComponent } from "../../common/components/SaveComponent";
import { programInitialState } from "../Constant";
import { programReducer } from "../Reducers";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import ProgramService from "../service/ProgramService";
import EditProgramFields from "./EditProgramFields";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import {
  getMessageTemplates,
  saveMessageRules,
} from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { identity } from "lodash";
import { useSelector } from "react-redux";

import { getDBValidationError } from "../../formDesigner/common/ErrorUtil";

const ProgramCreate = () => {
  const navigate = useNavigate();
  const organisationConfig = useSelector(
    (state) => state.app.organisationConfig,
  );
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [errors, setErrors] = useState(new Map());
  const [msgError, setMsgError] = useState("");
  const [saved, setSaved] = useState(false);
  const [id, setId] = useState();
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [subjectType, setSubjectType] = useState(null);
  const [formList, setFormList] = useState([]);
  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(
    MessageReducer,
    {
      rules: [],
      templates: [],
    },
  );

  const entityType = "ProgramEnrolment";

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  useEffect(() => {
    if (saved && id) {
      navigate(`/appDesigner/program/${id}/show`);
    }
  }, [saved, id, navigate]);

  const onRulesChange = (rules) => {
    rulesDispatch({ type: "setRules", payload: rules });
  };

  useEffect(() => {
    dispatch({ type: "setLoaded" });
    http.get("/web/operationalModules").then((response) => {
      setFormList(response.data.forms);
      setSubjectTypes(response.data.subjectTypes);
    });
  }, []);

  const onSubmit = () => {
    let [errors, jsCodeEECDR, jsCodeMEECDR] = ProgramService.validateProgram(
      program,
      subjectType,
    );
    ProgramService.updateJSRules(program, errors, jsCodeEECDR, jsCodeMEECDR);
    if (errors.size !== 0) {
      setErrors(errors);
      return;
    }

    return ProgramService.saveProgram(program, subjectType)
      .then((saveResponse) => {
        setErrors(saveResponse.errors);
        setSaved(saveResponse.status === 200);
        if (saveResponse.errors.size === 0) {
          setId(saveResponse.id);
          setMsgError("");
        }
        return saveResponse.programId;
      })
      .then((programId) => saveMessageRules(entityType, programId, rules))
      .catch((error) => {
        !error.response.data.message &&
          setMsgError(getDBValidationError(error));
      });
  };

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
      }}
    >
      <DocumentationContainer filename={"Program.md"}>
        <Title title={"Create Program "} />
        <div className="container" style={{ float: "left" }}>
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
              msgError={msgError}
            />
          ) : (
            <></>
          )}
          <br />
          <br />
          <SaveComponent onSubmit={onSubmit} name="Save" />
        </div>
      </DocumentationContainer>
    </Box>
  );
};

export default ProgramCreate;
