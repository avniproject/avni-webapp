import Editor from "react-simple-code-editor";
import Prism from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import { useEffect, useState } from "react";
import * as esprima from "esprima";

const styles = {
  editorContainer: {
    margin: "20px auto",
    padding: "1px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    fontFamily: "Arial, sans-serif"
  },
  editor: {
    fontFamily: '"Fira code", "Fira Mono", monospace',
    fontSize: 15,
    width: "100%",
    height: "auto",
    borderStyle: "solid",
    borderWidth: "1px",
    borderRadius: "8px",
    backgroundColor: "#f5f5f5"
  },
  pre: {
    margin: 0,
    padding: "1px",
    backgroundColor: "#333",
    color: "black",
    borderRadius: "8px",
    whiteSpace: "pre-wrap"
  },
  errorMessage: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#ffdddd",
    borderRadius: "8px",
    border: "1px solid #d8000c",
    fontSize: "14px"
  },
  errorPre: {
    color: "black",
    borderRadius: "2px",
    backgroundColor: "#ffdddd",
    margin: 0
  }
};

export const JSEditor = ({ value, onValueChange, readOnly = false, disabled = false }) => {
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
    <div style={styles.editorContainer}>
      <Editor
        readOnly={readOnly}
        disabled={disabled}
        value={value || " "}
        onValueChange={onValueChange}
        highlight={code => Prism.highlight(code, Prism.languages.js)}
        padding={10}
        style={styles.editor}
      />
      {error && !error.success && (
        <div style={styles.errorMessage}>
          <pre style={styles.errorPre}>{error.error}</pre>
        </div>
      )}
    </div>
  );
};
