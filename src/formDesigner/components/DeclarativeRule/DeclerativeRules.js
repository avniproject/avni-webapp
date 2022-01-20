import React, { useEffect, useState, useReducer } from "react";
import DeclarativeRuleComponent from "./DeclarativeRuleComponent";
import { isEmpty, map, size } from "lodash";
import RuleSummaryComponent from "./RuleSummaryComponent";
import Button from "@material-ui/core/Button";
import { DeclarativeRuleHolder } from "rules-config";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import IconButton from "../IconButton";
import FeatureToggle from "../../FeatureToggle";
import { Box, Typography } from "@material-ui/core";
import DeclarativeRuleContext from "./DeclarativeRuleContext";
import { DeclarativeRuleReducer } from "./DeclarativeRuleReducer";

const DeclarativeRules = ({ ruleJson, onValueChange, jsCode, updateJsCode, ...props }) => {
  if (!FeatureToggle.ENABLE_DECLARATIVE_RULE) return null;

  const initialState = DeclarativeRuleHolder.fromResource(ruleJson);
  const [declarativeRuleHolder, dispatcher] = useReducer(DeclarativeRuleReducer, initialState);
  const [summaries, setSummaries] = useState(declarativeRuleHolder.generateRuleSummary());
  const { declarativeRules } = declarativeRuleHolder;

  const dispatch = ({ type, payload = {} }) => {
    const updateProps = newState => onValueChange(newState);
    dispatcher({ type, payload: { ...payload, updateProps } });
  };

  useEffect(() => {
    if (isEmpty(ruleJson)) {
      dispatch({ type: "resetState" });
      setSummaries();
    }
  }, [jsCode]);

  const onOk = () => {
    onValueChange(declarativeRuleHolder);
    setSummaries(declarativeRuleHolder.generateRuleSummary());
    updateJsCode(declarativeRuleHolder);
  };

  console.log(JSON.stringify(declarativeRuleHolder, null, 2));

  return (
    <DeclarativeRuleContext.Provider
      value={{
        state: declarativeRuleHolder,
        dispatch: dispatch
      }}
    >
      {!isEmpty(summaries) && (
        <Box component={"div"} mb={1} p={2} border={1}>
          <Typography gutterBottom variant={"subtitle1"}>
            {"Summary"}
          </Typography>
          {map(summaries, (summary, index) => (
            <RuleSummaryComponent
              summary={summary}
              ruleNumber={index + 1}
              displayRuleCounts={size(summaries) > 1}
            />
          ))}
        </Box>
      )}
      {map(declarativeRules, (declarativeRule, index) => (
        <DeclarativeRuleComponent declarativeRuleIndex={index} declarativeRule={declarativeRule} />
      ))}
      <IconButton
        Icon={AddCircleIcon}
        label={"Add new declarative rule"}
        onClick={() => dispatch({ type: "newDeclarativeRule" })}
        disabled={declarativeRuleHolder.isPartiallyEmpty()}
      />
      <div>
        <Button
          style={{ marginTop: 20, marginBottom: 10 }}
          variant="contained"
          color={"primary"}
          onClick={onOk}
          disabled={declarativeRuleHolder.isPartiallyEmpty()}
        >
          {"Ok"}
        </Button>
      </div>
    </DeclarativeRuleContext.Provider>
  );
};

export default DeclarativeRules;
