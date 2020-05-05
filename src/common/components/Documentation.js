import React from "react";
import ReactMarkdown from "react-markdown";
import documentation from "../../documentation/documentation";

export const Documentation = () => {
  return (
    <div style={{ backgroundColor: "#f6f6f6", borderRadius: 6, padding: 16, margin: 7 }}>
      <ReactMarkdown source={documentation.content} escapeHtml={false} />
    </div>
  );
};
