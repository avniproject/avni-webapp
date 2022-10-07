import { Redirect } from "react-router-dom";
import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import { encounterTypeInitialState } from "../Constant";
import { encounterTypeReducer } from "../Reducers";
import _, { identity } from "lodash";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { validateRule } from "../../formDesigner/util";
import EditEncounterTypeFields from "./EditEncounterTypeFields";
import EncounterTypeErrors from "./EncounterTypeErrors";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import { getMessageTemplates, saveMessageRules } from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";

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
  const [formList, setFormList] = useState([]);
  const [ruleValidationError, setRuleValidationError] = useState();
  const [entityType, setEntityType] = useState();
  const [{ rules, templates }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [],
    templates: []
  });

  const onRulesChange = rules => {
    rulesDispatch({ type: "setRules", payload: rules });
  };

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  useEffect(() => {
    dispatch({ type: "setLoaded" });
    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
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
    const { jsCode, validationError } = validateRule(
      encounterType.encounterEligibilityCheckDeclarativeRule,
      holder => holder.generateEligibilityRule()
    );
    if (!_.isEmpty(validationError)) {
      hasError = true;
      setRuleValidationError(validationError);
    } else if (!_.isEmpty(jsCode)) {
      encounterType.encounterEligibilityCheckRule = jsCode;
    }
    if (hasError) {
      return;
    }

    setNameValidation(false);
    setSubjectValidation(false);
    http
      .post("/web/encounterType", {
        ...encounterType,
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
          return response.data;
        }
      })
      .then(encounterType => saveMessageRules(entityType, encounterType.encounterTypeId, rules))
      .catch(error => {
        setError(error.response.data.message);
      });
  };

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
      setEntityType("ProgramEncounter");
      if (formType === "ProgramEncounter") {
        resetValue("programEncounterForm");
      }
      if (cancelFormType === "ProgramEncounterCancellation") {
        resetValue("programEncounterCancellationForm");
      }
    } else {
      setEntityType("Encounter");
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
              <EditEncounterTypeFields
                encounterType={encounterType}
                dispatch={dispatch}
                subjectT={subjectT}
                setSubjectT={setSubjectT}
                subjectType={subjectType}
                programT={programT}
                updateProgram={updateProgram}
                program={program}
                formList={formList}
                ruleValidationError={ruleValidationError}
              />
              <MessageRules
                rules={rules}
                templates={templates}
                onChange={onRulesChange}
                entityType={entityType}
                entityTypeId={encounterType.encounterTypeId}
              />
              <EncounterTypeErrors
                nameValidation={nameValidation}
                subjectValidation={subjectValidation}
                error={error}
              />
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
