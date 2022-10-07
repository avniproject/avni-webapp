import Editor from "react-simple-code-editor";
import Prism from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import React from "react";

export const JSEditor = ({ value, onValueChange, readOnly = false, disabled = false }) => {
  return (
    <Editor
      readOnly={readOnly}
      disabled={disabled}
      value={value || " "}
      onValueChange={onValueChange}
      highlight={code => Prism.highlight(code, Prism.languages.js)}
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
  );
};
