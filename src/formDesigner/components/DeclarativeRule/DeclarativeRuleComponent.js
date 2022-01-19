import React, { useEffect, useReducer, useState } from "react";
import { DeclarativeRule } from "rules-config";
import { map, find, isEmpty } from "lodash";
import ActionComponent from "./ActionComponent";
import ConditionComponent from "./ConditionComponent";
import { DeclarativeRuleReducer } from "./DeclarativeRuleReducer";
import DeclarativeRuleContext from "./DeclarativeRuleContext";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import IconButton from "../IconButton";
import { Box, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import RuleSummaryComponent from "./RuleSummaryComponent";
import FeatureToggle from "../../FeatureToggle";

const DeclarativeRuleComponent = ({ json, onValueChange, jsCode, updateJsCode, ...props }) => {
  if (!FeatureToggle.ENABLE_DECLARATIVE_RULE) return null;

  const initialState = DeclarativeRule.fromResource(json);
  const [declarativeRule, dispatcher] = useReducer(DeclarativeRuleReducer, initialState);
  const [summary, setSummary] = useState();

  useEffect(() => {
    if (isEmpty(json)) {
      dispatch({ type: "resetState" });
      setSummary();
    }
  }, [jsCode]);

  const dispatch = ({ type, payload = {} }) => {
    const updateProps = newState => onValueChange(newState);
    dispatcher({ type, payload: { ...payload, updateProps } });
  };

  const onOk = () => {
    setSummary(declarativeRule.getRuleSummary());
    updateJsCode(declarativeRule);
  };

  console.log(JSON.stringify(declarativeRule, null, 2));

  return (
    <Box component={"div"} border={1} p={1} mb={1}>
      <DeclarativeRuleContext.Provider
        value={{
          state: declarativeRule,
          dispatch: dispatch
        }}
      >
        <RuleSummaryComponent summary={summary} />
        {map(declarativeRule.conditions, (condition, index) => (
          <ConditionComponent key={index} condition={condition} index={index} />
        ))}
        <IconButton
          Icon={AddCircleIcon}
          label={"Add new condition"}
          onClick={() => dispatch({ type: "newCondition" })}
          disabled={!!find(declarativeRule.conditions, condition => isEmpty(condition.conjunction))}
        />
        <Typography gutterBottom variant={"subtitle1"}>
          {"Actions"}
        </Typography>
        {map(declarativeRule.actions, (action, index) => (
          <ActionComponent key={index} action={action} index={index} />
        ))}
      </DeclarativeRuleContext.Provider>
      <Button
        style={{ marginTop: 20, marginBottom: 10 }}
        variant="contained"
        color={"primary"}
        onClick={onOk}
      >
        {"Ok"}
      </Button>
    </Box>
  );
};

export default DeclarativeRuleComponent;
