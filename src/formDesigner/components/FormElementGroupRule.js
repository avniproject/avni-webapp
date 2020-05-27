import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import React from "react";
import Box from "@material-ui/core/Box";
import { sampleFormElementGroupRule } from "../common/SampleRule";

export const FormElementGroupRule = ({ rule, onChange, index }) => {
  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <Editor
        value={rule || sampleFormElementGroupRule()}
        onValueChange={event => onChange(index, event)}
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
      />
    </Box>
  );
};
