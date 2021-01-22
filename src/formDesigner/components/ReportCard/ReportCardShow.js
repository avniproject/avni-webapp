import React from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import FormLabel from "@material-ui/core/FormLabel";
import ColorValue from "../../common/ColorValue";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import ResourceShowView from "../../common/ResourceShowView";

export const ReportCardShow = props => {
  const renderColumns = reportCard => {
    return (
      <div>
        <ShowLabelValue label={"Name"} value={reportCard.name} />
        <p />
        <ShowLabelValue label={"Description"} value={reportCard.description} />
        <p />
        <div>
          <FormLabel style={{ fontSize: "13px" }}>{"Colour"}</FormLabel>
          <br />
          <ColorValue colour={reportCard.color} />
        </div>
        <p />
        <div>
          <FormLabel style={{ fontSize: "13px" }}>Query</FormLabel>
          <br />
          <Editor
            readOnly
            value={reportCard.query ? reportCard.query : ""}
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
      </div>
    );
  };

  return (
    <ResourceShowView
      title={"Offline Report Card"}
      resourceId={props.match.params.id}
      resourceName={"card"}
      resourceURLName={"reportCard"}
      renderColumns={card => renderColumns(card)}
    />
  );
};
