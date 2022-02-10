import React, { Fragment } from "react";
import DeclarativeRules from "./DeclerativeRules";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import { useSelector } from "react-redux";
import { isRuleDesignerEnabled } from "../../../rootApp/ducks";

const RuleDesigner = ({
  rulesJson,
  onValueChange,
  updateJsCode,
  jsCode,
  error,
  subjectType,
  formType,
  getApplicableActions,
  sampleRule,
  onJsCodeChange,
  disableEditor
}) => {
  const showDeclarativeRules = useSelector(isRuleDesignerEnabled);
  return (
    <Fragment>
      {showDeclarativeRules && (
        <DeclarativeRules
          rulesJson={rulesJson}
          onValueChange={onValueChange}
          updateJsCode={updateJsCode}
          jsCode={jsCode}
          error={error}
          subjectType={subjectType}
          formType={formType}
          isRuleDesignerEnabled={isRuleDesignerEnabled}
          getApplicableActions={getApplicableActions}
        />
      )}
      <Editor
        value={jsCode || sampleRule}
        onValueChange={onJsCodeChange}
        highlight={code => highlight(code, languages.js)}
        disabled={disableEditor}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 15,
          width: "100%",
          height: "auto",
          borderStyle: "solid",
          borderWidth: "1px"
        }}
      />
    </Fragment>
  );
};

export default RuleDesigner;
