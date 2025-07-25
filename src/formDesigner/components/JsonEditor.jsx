import { highlight, languages } from "prismjs/components/prism-core";

import Editor from "react-simple-code-editor";
import { ValidationError } from "./ValidationError";

export const JsonEditor = ({
  value,
  onChange,
  validationError,
  readOnly = false
}) => {
  return (
    <>
      <Editor
        readOnly={readOnly}
        value={value ? value : ""}
        onValueChange={event => onChange(event)}
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
      <ValidationError validationError={validationError} />
    </>
  );
};
