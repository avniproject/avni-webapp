import React, { useEffect, useState, useReducer } from "react";
import DeclarativeRuleComponent from "./DeclarativeRuleComponent";
import { isEmpty, map, size, noop, get } from "lodash";
import RuleSummaryComponent from "./RuleSummaryComponent";
import { Button, Box, Typography } from "@mui/material";
import { DeclarativeRuleHolder } from "rules-config";
import { AddCircle } from "@mui/icons-material";
import IconButton from "../IconButton";
import DeclarativeRuleContext from "./DeclarativeRuleContext";
import { DeclarativeRuleReducer } from "./DeclarativeRuleReducer";

const DeclarativeRules = ({
  rulesJson,
  onValueChange,
  jsCode,
  updateJsCode,
  error,
  subjectType,
  getApplicableActions = noop,
  encounterTypes = [],
  form,
  parentConceptUuid,
  ...props
}) => {
  const initialState = DeclarativeRuleHolder.fromResource(rulesJson);
  const [declarativeRuleHolder, dispatcher] = useReducer(DeclarativeRuleReducer, initialState);
  const [validationError, setValidationError] = useState();
  const summary = isEmpty(validationError) ? declarativeRuleHolder.generateRuleSummary() : null;
  const [summaries, setSummaries] = useState(summary);
  const { declarativeRules } = declarativeRuleHolder;
  const errorMessage = error || validationError;

  const updateProps = state => {
    setValidationError();
    const value = state.isEmpty() ? null : state.declarativeRules;
    onValueChange(value);
  };

  const dispatch = ({ type, payload = {} }) => {
    dispatcher({ type, payload: { ...payload, updateProps } });
  };

  useEffect(() => {
    if (isEmpty(rulesJson)) {
      dispatch({ type: "resetState" });
      setSummaries();
    }
  }, [jsCode]);

  const onValidateAndGenerateRule = () => {
    const errorMessage = declarativeRuleHolder.validateAndGetError();
    if (isEmpty(errorMessage)) {
      updateProps(declarativeRuleHolder);
      setSummaries(declarativeRuleHolder.generateRuleSummary());
      updateJsCode(declarativeRuleHolder);

      // Adding new action
      const declarativeRule = declarativeRuleHolder.getDeclarativeRuleAtIndex(0);
      if (declarativeRule.actions.length > 0) {
        dispatch({
          type: "newAction",
          payload: { declarativeRuleIndex: 0 }
        });
      }
    } else {
      setValidationError(errorMessage);
    }
  };

  return (
    <DeclarativeRuleContext.Provider
      value={{
        state: declarativeRuleHolder,
        dispatch: dispatch,
        formType: get(form, "formType"),
        subjectType: subjectType,
        encounterTypes: encounterTypes,
        form: form,
        parentConceptUuid: parentConceptUuid
      }}
    >
      {!isEmpty(errorMessage) && <div style={{ color: "red" }}>{errorMessage}</div>}
      {!isEmpty(summaries) && (
        <Box
          component={"div"}
          sx={{
            mb: 1,
            p: 2,
            border: 1
          }}
        >
          <Typography gutterBottom variant={"subtitle1"}>
            {"Summary"}
          </Typography>
          {map(summaries, (summary, index) => (
            <RuleSummaryComponent summary={summary} ruleNumber={index + 1} displayRuleCounts={size(summaries) > 1} />
          ))}
        </Box>
      )}
      {map(declarativeRules, (declarativeRule, index) => (
        <DeclarativeRuleComponent
          key={index}
          declarativeRuleIndex={index}
          declarativeRule={declarativeRule}
          getApplicableActions={getApplicableActions}
        />
      ))}
      <IconButton
        Icon={AddCircle}
        label={"Add new declarative rule"}
        onClick={() => dispatch({ type: "newDeclarativeRule" })}
        disabled={declarativeRuleHolder.isPartiallyEmpty()}
        size="large"
      />
      <div>
        <Button
          style={{ marginTop: 20, marginBottom: 10 }}
          variant="contained"
          color={"primary"}
          onClick={onValidateAndGenerateRule}
          disabled={declarativeRuleHolder.isPartiallyEmpty()}
        >
          {"Validate and generate rule"}
        </Button>
      </div>
    </DeclarativeRuleContext.Provider>
  );
};

export default DeclarativeRules;
