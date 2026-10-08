import { useNavigate } from "react-router-dom";
import { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { SaveComponent } from "../../common/components/SaveComponent";
import { encounterTypeInitialState } from "../Constant";
import { encounterTypeReducer } from "../Reducers";
import _, { identity } from "lodash";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { validateRule } from "../../formDesigner/util";
import EditEncounterTypeFields from "./EditEncounterTypeFields";
import EncounterTypeErrors from "./EncounterTypeErrors";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import {
  getMessageTemplates,
  saveMessageRules,
} from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { useSelector } from "react-redux";

import { getDBValidationError } from "../../formDesigner/common/ErrorUtil";

const EncounterTypeCreate = () => {
  const navigate = useNavigate();
  const organisationConfig = useSelector(
    (state) => state.app.organisationConfig,
  );

  const [encounterType, dispatch] = useReducer(
    encounterTypeReducer,
    encounterTypeInitialState,
  );
  const [nameValidation, setNameValidation] = useState(false);
  const [subjectValidation, setSubjectValidation] = useState(false);
  const [subjectT, setSubjectT] = useState({});
  const [subjectType, setSubjectType] = useState([]);
  const [programT, setProgramT] = useState({});
  const [program, setProgram] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [formMappings, setFormMappings] = useState([]);
  const [error, setError] = useState("");
  const [msgError, setMsgError] = useState("");
  const [alert, setAlert] = useState(false);
  const [id, setId] = useState();
  const [formList, setFormList] = useState([]);
  const [ruleValidationError, setRuleValidationError] = useState();
  const [entityType, setEntityType] = useState("Encounter");
  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(
    MessageReducer,
    {
      rules: [],
      templates: [],
    },
  );

  const onRulesChange = (rules) => {
    rulesDispatch({ type: "setRules", payload: rules });
  };

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  useEffect(() => {
    dispatch({ type: "setLoaded" });
    http.get("/web/operationalModules").then((response) => {
      const formMap = response.data.formMappings;
      formMap.map((l) => (l["isVoided"] = false));
      setFormMappings(formMap);
      setFormList(response.data.forms);
      setSubjectType(response.data.subjectTypes);
      setAllPrograms(response.data.programs);
    });
  }, []);

  useEffect(() => {
    if (alert && id) {
      navigate(`/appDesigner/encounterType/${id}/show`);
    }
  }, [alert, id, navigate]);

  const onSubmit = () => {
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
      (holder) => holder.generateEligibilityRule(),
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
    return http
      .post("/web/encounterType", {
        ...encounterType,
        subjectTypeUuid: subjectT.uuid,
        programEncounterFormUuid: _.get(
          encounterType,
          "programEncounterForm.formUUID",
        ),
        programEncounterCancelFormUuid: _.get(
          encounterType,
          "programEncounterCancellationForm.formUUID",
        ),
        programUuid: _.get(programT, "uuid"),
      })
      .then((response) => {
        if (response.status === 200) {
          setError("");
          setMsgError("");
          setAlert(true);
          setId(response.data.id);
          return response.data;
        }
      })
      .then((encounterType) =>
        saveMessageRules(entityType, encounterType.encounterTypeId, rules),
      )
      .catch((error) => {
        error.response.data.message
          ? setError(error.response.data.message)
          : setMsgError(getDBValidationError(error));
      });
  };

  function updateProgram(program) {
    setProgramT(program);
    if (_.isEmpty(program)) {
      setEntityType("Encounter");
    } else {
      setEntityType("ProgramEncounter");
    }
  }

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
      }}
    >
      <DocumentationContainer filename={"EncounterType.md"}>
        <Title title={"Create Encounter Type"} />
        <div className="container">
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
            formMappings={formMappings}
            setProgram={setProgram}
            allPrograms={allPrograms}
          />
          {organisationConfig && organisationConfig.enableMessaging ? (
            <MessageRules
              rules={rules}
              templates={templates}
              templateFetchError={templateFetchError}
              onChange={onRulesChange}
              entityType={entityType}
              entityTypeId={encounterType.encounterTypeId}
              msgError={msgError}
            />
          ) : (
            <></>
          )}
          <EncounterTypeErrors
            nameValidation={nameValidation}
            subjectValidation={subjectValidation}
            error={error}
          />
          <SaveComponent onSubmit={onSubmit} name="Save" />
        </div>
      </DocumentationContainer>
    </Box>
  );
};

export default EncounterTypeCreate;
