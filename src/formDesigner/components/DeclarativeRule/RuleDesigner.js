import React, { Fragment } from "react";
import DeclarativeRules from "./DeclarativeRules";
import { JSEditor } from "../../../common/components/JSEditor";

const RuleDesigner = ({
  rulesJson,
  onValueChange,
  updateJsCode,
  jsCode,
  error,
  subjectType,
  getApplicableActions,
  sampleRule,
  onJsCodeChange,
  disableEditor,
  encounterTypes,
  form,
  parentConceptUuid
}) => {
  return (
    <Fragment>
      <DeclarativeRules
        rulesJson={rulesJson}
        onValueChange={onValueChange}
        updateJsCode={updateJsCode}
        jsCode={jsCode}
        error={error}
        subjectType={subjectType}
        getApplicableActions={getApplicableActions}
        encounterTypes={encounterTypes}
        form={form}
        parentConceptUuid={parentConceptUuid}
      />
      <JSEditor
        value={jsCode || sampleRule}
        disabled={disableEditor}
        onValueChange={onJsCodeChange}
      />
    </Fragment>
  );
};

export default RuleDesigner;
