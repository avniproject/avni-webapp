import { Fragment } from "react";
import { Grid } from "@mui/material";
import MiddleText from "./MiddleText";
import InputField from "./InputField";
import { get, includes, isEmpty, map, startCase, zip } from "lodash";
import ConceptSearch from "./ConceptSearch";
import { inlineConceptDataType } from "../../common/constants";
import { Action, AddDecisionActionDetails, VisitScheduleActionDetails } from "rules-config";
import { getEncounterTypes, getForm, getFormType, useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import Select from "react-select";

function VisitScheduleDetails({ actionDetails, onActionChange, declarativeRuleIndex, index, dispatch }) {
  const dateFieldOptions = VisitScheduleActionDetails.getDateFieldOptions(getForm());
  const dateField = get(actionDetails, "dateField");
  const dateFieldUuid = get(actionDetails, "dateFieldUuid");
  const encounterTypes = getEncounterTypes();
  const selectedET = get(actionDetails, "encounterType");
  const selectedDateFieldOption = {
    label: startCase(dateField),
    value: { dateField, dateFieldUuid, toString: () => dateField }
  };

  const onEncounterTypeChange = value => {
    onActionChange("encounterType", value);
    onActionChange("encounterName", value);
  };

  return (
    <Fragment>
      <MiddleText text={"Of Type"} />
      <Grid size={2}>
        <Select
          placeholder="Select encounter type"
          value={selectedET ? { value: selectedET, label: selectedET } : null}
          options={map(encounterTypes, ({ name }) => ({ value: name, label: name }))}
          style={{ width: "auto" }}
          onChange={event => onEncounterTypeChange(event.value)}
        />
      </Grid>
      {!isEmpty(actionDetails.encounterType) && (
        <Fragment>
          <MiddleText text={"Visit name"} />
          <Grid size={2}>
            <InputField
              value={get(actionDetails, "encounterName")}
              onChange={event => onActionChange("encounterName", event.target.value)}
            />
          </Grid>
          <MiddleText text={"Using"} />
          <Grid size={2}>
            <Select
              placeholder="Date field to use"
              value={dateField ? selectedDateFieldOption : null}
              options={dateFieldOptions}
              style={{ width: "auto" }}
              onChange={event =>
                dispatch({
                  type: "visitDateField",
                  payload: { declarativeRuleIndex, index, ...event.value }
                })
              }
            />
          </Grid>
        </Fragment>
      )}
      {!isEmpty(dateField) && (
        <Fragment>
          <MiddleText text={"Schedule on"} />
          <Grid size={1}>
            <InputField
              type={"number"}
              value={get(actionDetails, "daysToSchedule")}
              onChange={event => onActionChange("daysToSchedule", event.target.value)}
            />
          </Grid>
          <MiddleText text={"Days, and Overdue after"} />
          <Grid size={1}>
            <InputField
              type={"number"}
              value={get(actionDetails, "daysToOverdue")}
              onChange={event => onActionChange("daysToOverdue", event.target.value)}
            />
          </Grid>
          <MiddleText text={`Days from the ${startCase(dateField)}`} />
        </Fragment>
      )}
    </Fragment>
  );
}

function DecisionDetails({ index, actionDetails, declarativeRuleIndex, onActionChange }) {
  const dispatch = useDeclarativeRuleDispatch();
  const selectedDecisionConcept = {
    label: actionDetails.conceptName,
    value: {
      name: actionDetails.conceptName,
      uuid: actionDetails.conceptUuid,
      dataType: actionDetails.conceptDataType
    }
  };
  const selectedDecisionValues = map(actionDetails.value, v => ({ label: v, value: { name: v } }));
  const selectedScope = get(actionDetails, "scope");
  const decisionScopes = AddDecisionActionDetails.formTypeToScopeMap[getFormType()] || [];

  return (
    <Fragment>
      <MiddleText text={"Name"} />
      <Grid size={4}>
        <ConceptSearch
          key={index}
          placeholder={"Search decision concept"}
          value={actionDetails.conceptName ? selectedDecisionConcept : null}
          onChange={event =>
            dispatch({
              type: "decisionConcept",
              payload: { declarativeRuleIndex, index, ...event.value }
            })
          }
          nonSupportedTypes={["NA"]}
        />
      </Grid>
      {!isEmpty(actionDetails.conceptName) && (
        <Fragment>
          <MiddleText text={"Value"} />
          <Grid size={2}>
            {actionDetails.conceptDataType === "Coded" ? (
              <ConceptSearch
                key={index}
                isMulti={true}
                placeholder={"search answer"}
                value={selectedDecisionValues}
                onChange={labelValues =>
                  dispatch({
                    type: "decisionCodedValue",
                    payload: { declarativeRuleIndex, index, labelValues }
                  })
                }
                nonSupportedTypes={inlineConceptDataType}
              />
            ) : (
              <InputField value={actionDetails.value} onChange={event => onActionChange("value", event.target.value)} />
            )}
          </Grid>
        </Fragment>
      )}
      {!isEmpty(actionDetails.value) && (
        <Fragment>
          <MiddleText text={"In"} />
          <Grid size={3}>
            <Select
              placeholder="Select scope"
              value={
                selectedScope
                  ? {
                      value: selectedScope,
                      label: startCase(selectedScope)
                    }
                  : null
              }
              options={map(decisionScopes, s => ({ value: s, label: startCase(s) }))}
              style={{ width: "auto" }}
              onChange={event => onActionChange("scope", event.value)}
            />
          </Grid>
        </Fragment>
      )}
    </Fragment>
  );
}

const ActionDetailsComponent = ({ selectedType, actionDetails, onActionChange, index, declarativeRuleIndex }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const actionTypes = Action.actionTypes;
  const selectedAnswersToSkipOptions = map(zip(actionDetails.answersToSkip, actionDetails.answerUuidsToSkip), ([name, uuid]) => ({
    label: name,
    value: { name, uuid, toString: () => uuid }
  }));
  const onAnswerToSkipChange = labelValues => {
    dispatch({ type: "answerToSkipChange", payload: { declarativeRuleIndex, index, labelValues } });
  };

  return (
    <Fragment>
      {selectedType === actionTypes.Value && (
        <Grid
          container
          direction={"row"}
          spacing={1}
          sx={{
            alignItems: "center"
          }}
          size={4}
        >
          <MiddleText text={"Is"} />
          <Grid size={11}>
            <InputField value={get(actionDetails, "value")} onChange={event => onActionChange("value", event.target.value)} />
          </Grid>
        </Grid>
      )}
      {selectedType === actionTypes.SkipAnswers && (
        <Grid size={4}>
          <ConceptSearch
            key={index}
            isMulti={true}
            placeholder={"Search answer"}
            value={selectedAnswersToSkipOptions}
            onChange={labelValues => onAnswerToSkipChange(labelValues)}
            nonSupportedTypes={inlineConceptDataType}
          />
        </Grid>
      )}
      {includes([actionTypes.ValidationError, actionTypes.FormValidationError], selectedType) && (
        <Grid
          container
          direction={"row"}
          spacing={1}
          sx={{
            alignItems: "center"
          }}
          size={8}
        >
          <MiddleText text={"Is"} />
          <Grid size={11}>
            <InputField
              value={get(actionDetails, "validationError")}
              onChange={event => onActionChange("validationError", event.target.value)}
            />
          </Grid>
        </Grid>
      )}
      {selectedType === actionTypes.AddDecision && (
        <DecisionDetails
          declarativeRuleIndex={declarativeRuleIndex}
          index={index}
          onActionChange={onActionChange}
          actionDetails={actionDetails}
        />
      )}
      {selectedType === actionTypes.ScheduleVisit && (
        <VisitScheduleDetails
          onActionChange={onActionChange}
          actionDetails={actionDetails}
          declarativeRuleIndex={declarativeRuleIndex}
          index={index}
          dispatch={dispatch}
        />
      )}
    </Fragment>
  );
};
export default ActionDetailsComponent;
