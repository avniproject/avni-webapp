import { Fragment } from "react";
import DeclarativeRules from "./DeclarativeRules";
import { JSEditor } from "../../../common/components/JSEditor";
import { Box } from "@mui/material";

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
  parentConceptUuid,
  onOpenAiRuleModal,
}) => {
  return (
    <>
      <Box sx={{ maxWidth: "75%" }}>
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
          onOpenAiRuleModal={onOpenAiRuleModal}
        />
      </Box>
      <JSEditor
        value={jsCode || sampleRule}
        disabled={disableEditor}
        onValueChange={onJsCodeChange}
      />
    </>
  );
};

export default RuleDesigner;
