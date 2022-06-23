import React, { Fragment } from "react";
import TreeItem from "@material-ui/lab/TreeItem";
import { filter, map } from "lodash";
import Button from "@material-ui/core/Button";
import { useDocumentationDispatch } from "../hooks";

export const renderButton = (label, onClick) => (
  <Button color="primary" type="button" onClick={onClick}>
    {label}
  </Button>
);

export const DocumentationNode = ({ documentationNode }) => {
  const dispatch = useDocumentationDispatch();
  const { uuid, name, documentations } = documentationNode;

  const onDocumentationToggle = documentation =>
    dispatch({ type: "toggleDocumentation", payload: documentation });

  const onNewDocumentation = () =>
    dispatch({ type: "newDocumentation", payload: { nodeUUID: uuid } });

  return (
    <Fragment>
      <TreeItem nodeId={uuid} label={name} onLabelClick={() => onDocumentationToggle(null)}>
        {map(filter(documentations, ({ voided }) => !voided), (documentation, idx) => {
          const { uuid, name } = documentation;
          return (
            <TreeItem
              key={uuid}
              nodeId={uuid}
              label={name}
              onLabelClick={() => onDocumentationToggle(documentation)}
            />
          );
        })}
        {renderButton("New Documentation", onNewDocumentation)}
      </TreeItem>
    </Fragment>
  );
};
