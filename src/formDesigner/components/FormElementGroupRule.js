import React from "react";
import { Box } from "@mui/material";
import { sampleFormElementGroupRule } from "../common/SampleRule";
import { confirmBeforeRuleEdit } from "../util";
import { get } from "lodash";
import RuleDesigner from "./DeclarativeRule/RuleDesigner";

export const FormElementGroupRule = ({
  groupData,
  updateFormElementGroupRule,
  updateFormElementGroupRuleJSON,
  index,
  disable,
  ...props
}) => {
  const onChange = event => {
    confirmBeforeRuleEdit(
      groupData.declarativeRule,
      () => updateFormElementGroupRule(index, event),
      () => updateFormElementGroupRuleJSON(index, null)
    );
  };

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <RuleDesigner
        rulesJson={groupData.declarativeRule}
        onValueChange={jsonData => updateFormElementGroupRuleJSON(index, jsonData)}
        updateJsCode={declarativeRuleHolder =>
          updateFormElementGroupRule(index, declarativeRuleHolder.generateFormElementGroupRule(props.entityName))
        }
        jsCode={groupData.rule}
        error={get(groupData, "errorMessage.ruleError")}
        subjectType={props.subjectType}
        form={props.form}
        getApplicableActions={state => state.getApplicableFormElementGroupRuleActions()}
        sampleRule={sampleFormElementGroupRule()}
        onJsCodeChange={onChange}
        disableEditor={disable}
      />
    </Box>
  );
};
