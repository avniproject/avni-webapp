import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import React from "react";
import Box from "@material-ui/core/Box";
import { sampleFormElementGroupRule } from "../common/SampleRule";
import { confirmBeforeRuleEdit } from "../util";
import { get } from "lodash";
import DeclarativeRules from "./DeclarativeRule/DeclerativeRules";

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
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <DeclarativeRules
        rulesJson={groupData.declarativeRule}
        onValueChange={jsonData => updateFormElementGroupRuleJSON(index, jsonData)}
        updateJsCode={declarativeRuleHolder =>
          updateFormElementGroupRule(
            index,
            declarativeRuleHolder.generateFormElementGroupRule(props.entityName)
          )
        }
        jsCode={groupData.rule}
        error={get(groupData, "errorMessage.ruleError")}
        subjectType={props.subjectType}
        formType={props.formType}
        isRuleDesignerEnabled={props.isRuleDesignerEnabled}
        getApplicableActions={state => state.getApplicableFromElementGroupRuleActions()}
      />
      <Editor
        value={groupData.rule || sampleFormElementGroupRule()}
        onValueChange={onChange}
        highlight={code => highlight(code, languages.js)}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 15,
          width: "100%",
          height: "auto",
          borderStyle: "solid",
          borderWidth: "1px"
        }}
        disabled={disable}
      />
    </Box>
  );
};
