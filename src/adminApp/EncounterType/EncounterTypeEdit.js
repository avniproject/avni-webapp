import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import { encounterTypeInitialState } from "../Constant";
import { encounterTypeReducer } from "../Reducers";
import _, { identity } from "lodash";
import {
  findProgramEncounterCancellationForm,
  findProgramEncounterForm
} from "../domain/formMapping";
import { SaveComponent } from "../../common/components/SaveComponent";
import { validateRule } from "../../formDesigner/util";
import EditEncounterTypeFields from "./EditEncounterTypeFields";
import EncounterTypeErrors from "./EncounterTypeErrors";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import { getMessageRules, getMessageTemplates, saveMessageRules } from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import { connect } from "react-redux";

const EncounterTypeEdit = ({ organisationConfig, ...props }) => {
  const [encounterType, dispatch] = useReducer(encounterTypeReducer, encounterTypeInitialState);
  const [nameValidation, setNameValidation] = useState(false);
  const [error, setError] = useState("");
  const [redirectShow, setRedirectShow] = useState(false);
  const [encounterTypeData, setEncounterTypeData] = useState({});
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [subjectT, setSubjectT] = useState({});
  const [subjectType, setSubjectType] = useState([]);
  const [programT, setProgramT] = useState({});
  const [program, setProgram] = useState([]);
  const [formList, setFormList] = useState([]);
  const [subjectValidation, setSubjectValidation] = useState(false);
  const [ruleValidationError, setRuleValidationError] = useState();
  const [entityType, setEntityType] = useState();
  const [{ rules, templates }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [],
    templates: []
  });

  useEffect(() => {
    getMessageRules(entityType, encounterType.encounterTypeId, rulesDispatch);
    return identity;
  }, [encounterType, entityType]);

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  const onRulesChange = rules => {
    rulesDispatch({ type: "setRules", payload: rules });
  };

  useEffect(() => {
    http
      .get("/web/encounterType/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setEncounterTypeData(result);
        dispatch({ type: "setData", payload: result });
        http
          .get("/web/operationalModules")
          .then(response => {
            const formMap = response.data.formMappings;
            formMap.map(l => (l["isVoided"] = false));
            setFormList(response.data.forms);
            setSubjectType(response.data.subjectTypes);
            setProgram(response.data.programs);

            const encounterTypeMappings = response.data.formMappings.filter(
              l => l.encounterTypeUUID === result.uuid
            );

            _.isNil(encounterTypeMappings[0].programUUID)
              ? setEntityType("Encounter")
              : setEntityType("ProgramEncounter");

            setSubjectT(
              response.data.subjectTypes.filter(
                l => l.uuid === encounterTypeMappings[0].subjectTypeUUID
              )[0]
            );
            setProgramT(
              response.data.programs.filter(l => l.uuid === encounterTypeMappings[0].programUUID)[0]
            );

            const form = findProgramEncounterForm(formMap, result);
            dispatch({ type: "programEncounterForm", payload: form });

            const cancellationForm = findProgramEncounterCancellationForm(formMap, result);
            dispatch({ type: "programEncounterCancellationForm", payload: cancellationForm });
          })
          .catch(error => {});
      });
  }, []);

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

    return http
      .put("/web/encounterType/" + props.match.params.id, {
        ...encounterType,
        id: props.match.params.id,
        subjectTypeUuid: subjectT.uuid,
        programEncounterFormUuid: _.get(encounterType, "programEncounterForm.formUUID"),
        programEncounterCancelFormUuid: _.get(
          encounterType,
          "programEncounterCancellationForm.formUUID"
        ),
        programUuid: _.get(programT, "uuid"),
        voided: encounterTypeData.voided
      })
      .then(response => {
        if (response.status === 200) {
          setError("");
        }
      })
      .then(() => saveMessageRules(entityType, encounterType.encounterTypeId, rules))
      .then(() => setRedirectShow(true));
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete encounter type?")) {
      http
        .delete("/web/encounterType/" + props.match.params.id)
        .then(response => {
          if (response.status === 200) {
            setDeleteAlert(true);
          }
        })
        .catch(error => {});
    }
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
      if (formType === "ProgramEncounter") {
        resetValue("programEncounterForm");
      }
      if (cancelFormType === "ProgramEncounterCancellation") {
        resetValue("programEncounterCancellationForm");
      }
    } else {
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
        <Title title={"Edit Encounter Type "} />
        <Grid container item={12} style={{ justifyContent: "flex-end" }}>
          <Button color="primary" type="button" onClick={() => setRedirectShow(true)}>
            <VisibilityIcon /> Show
          </Button>
        </Grid>
        <div className="container" style={{ float: "left" }}>
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
              />
              {organisationConfig && organisationConfig.enableMessaging ? (
                <MessageRules
                  rules={rules}
                  templates={templates}
                  onChange={onRulesChange}
                  entityType={entityType}
                  entityTypeId={encounterType.encounterTypeId}
                />
              ) : (
                <></>
              )}
            </>
          )}
          <EncounterTypeErrors
            nameValidation={nameValidation}
            subjectValidation={subjectValidation}
            error={error}
          />
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
      {redirectShow && <Redirect to={`/appDesigner/encounterType/${props.match.params.id}/show`} />}
      {deleteAlert && <Redirect to="/appDesigner/encounterType" />}
    </>
  );
};

const mapStateToProps = state => ({
  organisationConfig: state.app.organisationConfig
});
export default withRouter(connect(mapStateToProps)(EncounterTypeEdit));
