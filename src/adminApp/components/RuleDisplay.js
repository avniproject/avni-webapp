import React, { useEffect, useState } from "react";
import FormLabel from "@material-ui/core/FormLabel";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import PropTypes from "prop-types";

const RuleDisplay = props => {
  const { fieldLabel, ruleText, toolTipKey } = props;

  return (
    <div>
      <FormLabel style={{ fontSize: "13px" }} toolTipKey={toolTipKey}>
        {fieldLabel}
      </FormLabel>
      <br />
      <Editor
        readOnly
        value={ruleText || ""}
        highlight={code => highlight(code, languages.js)}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 15,
          height: "auto",
          borderStyle: "solid",
          borderWidth: "1px"
        }}
      />
    </div>
  );
};

RuleDisplay.propTypes = {
  fieldLabel: PropTypes.string.isRequired,
  ruleText: PropTypes.string.isRequired,
  toolTipKey: PropTypes.string
};

export default RuleDisplay;
