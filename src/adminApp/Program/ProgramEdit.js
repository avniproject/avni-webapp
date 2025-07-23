import { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Grid, Button } from "@mui/material";
import { Title } from "react-admin";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
import { getDBValidationError } from "../../formDesigner/common/ErrorUtil";

const ProgramEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const organisationConfig = useSelector(state => state.app.organisationConfig);

  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [errors, setErrors] = useState(new Map());
  const [msgError, setMsgError] = useState("");
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
      .get("/web/program/" + id)
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
  }, [id]);

  const onSubmit = () => {
    let [errors, jsCodeEECDR, jsCodeMEECDR] = ProgramService.validateProgram(program, subjectType);
    ProgramService.updateJSRules(program, errors, jsCodeEECDR, jsCodeMEECDR);

    if (errors.size !== 0) {
      setErrors(errors);
      return;
    }

    return ProgramService.saveProgram(program, subjectType, id)
      .then(saveResponse => {
        setErrors(saveResponse.errors);
        if (saveResponse.errors.size === 0) {
          setMsgError("");
        }
      })
      .then(() => saveMessageRules(entityType, program.programId, rules))
      .then(() => navigate(`/appDesigner/program/${id}/show`))
      .catch(error => {
        !error.response.data.message && setMsgError(getDBValidationError(error));
      });
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete program?")) {
      http.delete("/web/program/" + id).then(response => {
        if (response.status === 200) {
          navigate("/appDesigner/program");
        }
      });
    }
  };

  const handleShowClick = () => {
    navigate(`/appDesigner/program/${id}/show`);
  };

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%"
      }}
    >
      <Title title="Edit Program" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        <Button color="primary" type="button" onClick={handleShowClick}>
          <VisibilityIcon /> Show
        </Button>
      </Grid>
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        {" "}
        {/* Content area grows to push buttons down */}
        {program.loaded && (
          <>
            <EditProgramFields
              program={program}
              errors={errors}
              subjectTypes={subjectTypes}
              formList={formList}
              dispatch={dispatch}
              onSubjectTypeChange={setSubjectType}
              subjectType={subjectType}
            />
            <br />
            <AvniSwitch
              checked={program.active}
              onChange={event => dispatch({ type: "active", payload: event.target.checked })}
              name="Active"
              toolTipKey="APP_DESIGNER_PROGRAM_ACTIVE"
            />
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
          </>
        )}
      </Box>
      <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Grid>
          <SaveComponent name="save" onSubmit={onSubmit} />
        </Grid>
        <Grid>
          <Button color="error" onClick={() => onDelete()}>
            <DeleteIcon /> Delete
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgramEdit;
