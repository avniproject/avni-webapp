import Editor from "react-simple-code-editor";
import Prism from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import { useEffect, useState } from "react";
import * as esprima from "esprima";
import { styled } from "@mui/material/styles";

export const EditorContainer = styled("div")(({ theme }) => ({
  padding: "1px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: "12px",
  fontFamily: "Arial, sans-serif",
  maxWidth: "75%",
}));

export const EditorStyles = styled("div")({
  fontFamily: '"Fira code", "Fira Mono", monospace',
  fontSize: 15,
  width: "100%",
  height: "auto",
  borderStyle: "solid",
  borderWidth: "1px",
  borderRadius: "8px",
  backgroundColor: "#f5f5f5",
});

export const ErrorMessage = styled("div")({
  marginTop: "15px",
  padding: "10px",
  backgroundColor: "#ffdddd",
  borderRadius: "8px",
  border: "1px solid #d8000c",
  fontSize: "14px",
});

export const ErrorPre = styled("pre")({
  color: "black",
  borderRadius: "2px",
  backgroundColor: "#ffdddd",
  margin: 0,
});

export const JSEditor = ({
  value,
  onValueChange,
  readOnly = false,
  disabled = false,
}) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const ast = esprima.parseScript(value, { tolerant: true, range: true });
      setError({ success: true, data: ast });
    } catch (err) {
      setError({ success: false, error: `Error: ${err.message}` });
    }
  }, [value]);

  return (
    <EditorContainer>
      <EditorStyles>
        <Editor
          readOnly={readOnly}
          disabled={disabled}
          value={value || ""}
          onValueChange={onValueChange}
          highlight={(code) => Prism.highlight(code, Prism.languages.js)}
          padding={10}
        />
      </EditorStyles>

      {error && !error.success && (
        <ErrorMessage>
          <ErrorPre>{error.error}</ErrorPre>
        </ErrorMessage>
      )}
    </EditorContainer>
  );
};
