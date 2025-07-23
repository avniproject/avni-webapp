import { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Button } from "@mui/material";
import { Title } from "react-admin";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { encounterTypeInitialState } from "../Constant";
import { encounterTypeReducer } from "../Reducers";
import _, { identity } from "lodash";
import { findProgramEncounterCancellationForm, findProgramEncounterForm } from "../domain/formMapping";
import { SaveComponent } from "../../common/components/SaveComponent";
import { validateRule } from "../../formDesigner/util";
import EditEncounterTypeFields from "./EditEncounterTypeFields";
import EncounterTypeErrors from "./EncounterTypeErrors";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import { getMessageRules, getMessageTemplates, saveMessageRules } from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { useSelector } from "react-redux";
import { getDBValidationError } from "../../formDesigner/common/ErrorUtil";

const EncounterTypeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const organisationConfig = useSelector(state => state.app.organisationConfig);
  const [encounterType, dispatch] = useReducer(encounterTypeReducer, encounterTypeInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [error, setError] = useState("");
  const [msgError, setMsgError] = useState("");
  const [redirectShow, setRedirectShow] = useState(false);
  const [encounterTypeData, setEncounterTypeData] = useState({});
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [subjectT, setSubjectT] = useState({});
  const [subjectType, setSubjectType] = useState([]);
  const [programT, setProgramT] = useState({});
  const [program, setProgram] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [formMappings, setFormMappings] = useState([]);
  const [formList, setFormList] = useState([]);
  const [subjectValidation, setSubjectValidation] = useState(false);
  const [ruleValidationError, setRuleValidationError] = useState();
  const [entityType, setEntityType] = useState();
  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [],
    templates: []
  });

  useEffect(() => {
    console.log("useEffect for message rules, entityType:", entityType, "encounterTypeId:", encounterType.encounterTypeId);
    getMessageRules(entityType, encounterType.encounterTypeId, rulesDispatch);
    return identity;
  }, [encounterType, entityType]);

  useEffect(() => {
    console.log("Fetching message templates");
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  useEffect(() => {
    if (redirectShow) {
      navigate(`/appDesigner/encounterType/${id}/show`);
    }
  }, [redirectShow, id, navigate]);

  useEffect(() => {
    if (deleteAlert) {
      navigate("/appDesigner/encounterType");
    }
  }, [deleteAlert, navigate]);

  const onRulesChange = rules => {
    console.log("Message rules updated:", rules);
    rulesDispatch({ type: "setRules", payload: rules });
  };

  useEffect(() => {
    console.log("Fetching data for encounterTypeId:", id);
    dispatch({ type: "reset", payload: encounterTypeInitialState });
    setEncounterTypeData({});
    setSubjectT({});
    setProgramT({});
    setFormMappings([]);
    setFormList([]);
    setSubjectType([]);
    setAllPrograms([]);
    setEntityType(null);

    http
      .get("/web/encounterType/" + id)
      .then(response => response.data)
      .then(result => {
        console.log("Encounter type data:", result);
        setEncounterTypeData(result);
        dispatch({ type: "setData", payload: result });
        http
          .get("/web/operationalModules")
          .then(response => {
            const formMap = response.data.formMappings || [];
            formMap.forEach(l => (l["isVoided"] = false));
            console.log("Form mappings:", formMap);
            setFormMappings(formMap);
            setFormList(response.data.forms || []);
            setSubjectType(response.data.subjectTypes || []);
            setAllPrograms(response.data.programs || []);
            console.log("Programs:", response.data.programs || []);

            const encounterTypeMappings = formMap.filter(l => l.encounterTypeUUID === result.uuid);
            console.log("Encounter type mappings for UUID", result.uuid, ":", encounterTypeMappings);

            if (encounterTypeMappings.length === 0) {
              console.warn("No encounter type mappings found for UUID:", result.uuid);
              setEntityType("Encounter");
              setProgramT({});
              dispatch({ type: "programEncounterForm", payload: null });
              dispatch({ type: "programEncounterCancellationForm", payload: null });
              console.log("Current encounterType state after dispatch:", encounterType);
              return;
            }

            const programUUID = encounterTypeMappings[0].programUUID;
            console.log("Program UUID from mappings:", programUUID);
            setEntityType(_.isNil(programUUID) ? "Encounter" : "ProgramEncounter");

            const subject = (response.data.subjectTypes || []).find(l => l.uuid === encounterTypeMappings[0].subjectTypeUUID);
            setSubjectT(subject || {});
            console.log("Subject type:", subject);

            const program = (response.data.programs || []).find(l => l.uuid === programUUID);
            setProgramT(program || {});
            console.log("Program set to programT:", program);

            const form = findProgramEncounterForm(formMap, result);
            console.log("Program encounter form:", form);
            if (form) {
              dispatch({ type: "programEncounterForm", payload: form });
            } else {
              console.warn("No program encounter form found for encounter type:", result);
              dispatch({ type: "programEncounterForm", payload: null });
            }

            const cancellationForm = findProgramEncounterCancellationForm(formMap, result);
            console.log("Program encounter cancellation form:", cancellationForm);
            if (cancellationForm) {
              dispatch({ type: "programEncounterCancellationForm", payload: cancellationForm });
            } else {
              console.warn("No program encounter cancellation form found for encounter type:", result);
              dispatch({ type: "programEncounterCancellationForm", payload: null });
            }

            console.log("Current encounterType state after dispatch:", encounterType);
          })
          .catch(error => {
            console.error("Failed to fetch operational modules:", error);
          });
      })
      .catch(error => {
        console.error("Failed to fetch encounter type:", error);
      });

    return () => {
      console.log("Cleaning up for encounterTypeId:", id);
      dispatch({ type: "reset", payload: encounterTypeInitialState });
    };
  }, [id]);

  const onSubmit = () => {
    console.log("Submitting encounter type:", encounterType, "with programT:", programT);
    let hasError = false;
    if (encounterType.name.trim() === "") {
      setNameValidation(true);
      hasError = true;
    }

    if (_.isEmpty(subjectT)) {
      setSubjectValidation(true);
      hasError = true;
    }
    const { jsCode, validationError } = validateRule(encounterType.encounterEligibilityCheckDeclarativeRule, holder =>
      holder.generateEligibilityRule()
    );
    if (!_.isEmpty(validationError)) {
      hasError = true;
      setRuleValidationError(validationError);
    } else if (!_.isEmpty(jsCode)) {
      encounterType.encounterEligibilityCheckRule = jsCode;
    }
    if (hasError) {
      console.log("Validation errors detected:", { nameValidation, subjectValidation, ruleValidationError });
      return;
    }

    setNameValidation(false);
    setSubjectValidation(false);

    return http
      .put("/web/encounterType/" + id, {
        ...encounterType,
        id: id,
        subjectTypeUuid: subjectT.uuid,
        programEncounterFormUuid: _.get(encounterType, "programEncounterForm.formUUID"),
        programEncounterCancelFormUuid: _.get(encounterType, "programEncounterCancellationForm.formUUID"),
        programUuid: _.get(programT, "uuid"),
        voided: encounterTypeData.voided
      })
      .then(response => {
        if (response.status === 200) {
          setError("");
          setMsgError("");
          console.log("Successfully saved encounter type:", id);
        }
      })
      .then(() => saveMessageRules(entityType, encounterType.encounterTypeId, rules))
      .then(() => setRedirectShow(true))
      .catch(error => {
        console.error("Failed to save encounter type:", error);
        error.response.data.message ? setError(error.response.data.message) : setMsgError(getDBValidationError(error));
      });
  };

  const onDelete = () => {
    console.log("Deleting encounter type:", id);
    if (window.confirm("Do you really want to delete encounter type?")) {
      http
        .delete("/web/encounterType/" + id)
        .then(response => {
          if (response.status === 200) {
            setDeleteAlert(true);
            console.log("Successfully deleted encounter type:", id);
          }
        })
        .catch(error => {
          console.error("Failed to delete encounter type:", error);
        });
    }
  };

  function resetValue(type) {
    console.log("Resetting value for type:", type);
    dispatch({
      type,
      payload: null
    });
  }

  function updateProgram(program) {
    console.log("Updating programT to:", program);
    setProgramT(program);
    const formType = _.get(encounterType, "programEncounterForm.formType");
    const cancelFormType = _.get(encounterType, "programEncounterCancellationForm.formType");

    if (_.isEmpty(program)) {
      console.log("Program is empty, checking form types:", { formType, cancelFormType });
      if (formType === "ProgramEncounter") {
        console.log("Resetting programEncounterForm");
        resetValue("programEncounterForm");
      }
      if (cancelFormType === "ProgramEncounterCancellation") {
        console.log("Resetting programEncounterCancellationForm");
        resetValue("programEncounterCancellationForm");
      }
    } else {
      console.log("Program is set, checking form types:", { formType, cancelFormType });
      if (formType === "Encounter") {
        console.log("Resetting programEncounterForm due to Encounter form type");
        resetValue("programEncounterForm");
      }
      if (cancelFormType === "IndividualEncounterCancellation") {
        console.log("Resetting programEncounterCancellationForm due to IndividualEncounterCancellation form type");
        resetValue("programEncounterCancellationForm");
      }
    }
    console.log("EncounterType state after updateProgram:", encounterType);
  }

  const handleShowClick = () => {
    setRedirectShow(true);
  };

  console.log("Rendering EditEncounterTypeFields with props:", {
    encounterType,
    subjectT,
    programT,
    formList,
    formMappings,
    allPrograms
  });

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
      <Title title="Edit Encounter Type" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        <Button color="primary" type="button" onClick={handleShowClick}>
          <VisibilityIcon /> Show
        </Button>
      </Grid>
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        {encounterType.loaded && (
          <>
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
                templateFetchError={templateFetchError}
                rules={rules}
                templates={templates}
                onChange={onRulesChange}
                entityType={entityType}
                entityTypeId={encounterType.encounterTypeId}
                msgError={msgError}
              />
            ) : (
              <></>
            )}
            <EncounterTypeErrors nameValidation={nameValidation} subjectValidation={subjectValidation} error={error} />
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

export default EncounterTypeEdit;
