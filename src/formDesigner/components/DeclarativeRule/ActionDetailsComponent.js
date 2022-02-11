import React, { Fragment } from "react";
import { Grid } from "@material-ui/core";
import MiddleText from "./MiddleText";
import InputField from "./InputField";
import { get, includes, map, zip, isEmpty, startCase } from "lodash";
import ConceptSearch from "./ConceptSearch";
import { inlineConceptDataType } from "../../common/constants";
import { Action, AddDecisionActionDetails } from "rules-config";
import { getFormType, useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import Select from "react-select";

const ActionDetailsComponent = ({
  selectedType,
  actionDetails,
  onActionChange,
  index,
  declarativeRuleIndex
}) => {
  const dispatch = useDeclarativeRuleDispatch();
  const actionTypes = Action.actionTypes;
  const selectedAnswersToSkipOptions = map(
    zip(actionDetails.answersToSkip, actionDetails.answerUuidsToSkip),
    ([name, uuid]) => ({ label: name, value: { name, uuid, toString: () => uuid } })
  );
  const onAnswerToSkipChange = labelValues => {
    dispatch({ type: "answerToSkipChange", payload: { declarativeRuleIndex, index, labelValues } });
  };
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
      {selectedType === actionTypes.Value && (
        <Grid item container xs={5} alignItems={"center"} direction={"row"} spacing={1}>
          <MiddleText text={"Is"} />
          <Grid item xs={11}>
            <InputField
              variant="outlined"
              value={get(actionDetails, "value")}
              onChange={event => onActionChange("value", event.target.value)}
            />
          </Grid>
        </Grid>
      )}
      {selectedType === actionTypes.SkipAnswers && (
        <Grid item xs={4}>
          <ConceptSearch
            key={index}
            isMulti={true}
            placeholder={"Type to search concept answers"}
            value={selectedAnswersToSkipOptions}
            onChange={labelValues => onAnswerToSkipChange(labelValues)}
            nonSupportedTypes={inlineConceptDataType}
          />
        </Grid>
      )}
      {includes([actionTypes.ValidationError, actionTypes.FormValidationError], selectedType) && (
        <Grid item container xs={8} alignItems={"center"} direction={"row"} spacing={1}>
          <MiddleText text={"Is"} />
          <Grid item xs={11}>
            <InputField
              variant="outlined"
              value={get(actionDetails, "validationError")}
              onChange={event => onActionChange("validationError", event.target.value)}
            />
          </Grid>
        </Grid>
      )}
      {selectedType === actionTypes.AddDecision && (
        <Fragment>
          <MiddleText text={"Name"} />
          <Grid item xs={4}>
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
              <Grid item xs={3}>
                {actionDetails.conceptDataType === "Coded" ? (
                  <ConceptSearch
                    key={index}
                    isMulti={true}
                    placeholder={"Type to search concept answers"}
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
                  <InputField
                    variant="outlined"
                    value={actionDetails.value}
                    onChange={event => onActionChange("value", event.target.value)}
                  />
                )}
              </Grid>
            </Fragment>
          )}
          {!isEmpty(actionDetails.value) && (
            <Fragment>
              <MiddleText text={"In"} />
              <Grid item xs={4}>
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
      )}
    </Fragment>
  );
};

export default ActionDetailsComponent;
