import React from "react";
import { getDocumentationState, useDocumentationDispatch } from "../hooks";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import { find, forEach, isEmpty, map } from "lodash";
import TextField from "@material-ui/core/TextField";
import { DocumentationItem } from "./DocumentationItem";
import { SaveComponent } from "../../common/components/SaveComponent";
import api from "../api";
import { convertEditorStateToRaw } from "../reducers";
import DeleteIcon from "@material-ui/icons/Delete";
import Button from "@material-ui/core/Button";
import Colors from "../../dataEntryApp/Colors";
import { Grid } from "@material-ui/core";
import { Audit } from "../../formDesigner/components/Audit";

function renderDocumentItem(value, index, selectedDocumentation, locale) {
  return (
    <div key={index} role="tabpanel" hidden={value !== index} id={`doc-tab-${index}`}>
      {value === index && (
        <DocumentationItem
          documentationItem={find(
            selectedDocumentation.documentationItems,
            ({ language }) => locale === language
          )}
          language={locale}
        />
      )}
    </div>
  );
}

export const Documentation = () => {
  const { selectedDocumentation, languages, documentationNodes } = getDocumentationState();
  const dispatch = useDocumentationDispatch();
  const [value, setValue] = React.useState(0);

  if (isEmpty(selectedDocumentation)) return null;
  const selectedNode = find(
    documentationNodes,
    ({ uuid }) => uuid === selectedDocumentation.documentationNodeUUID
  );
  const {
    name,
    createdBy,
    createdDateTime,
    lastModifiedBy,
    lastModifiedDateTime
  } = selectedDocumentation;
  const onNodeNameChange = event =>
    dispatch({
      type: "changeNodeName",
      payload: { uuid: selectedNode.uuid, name: event.target.value }
    });

  const onDocumentationNameChange = event => {
    dispatch({
      type: "changeDocumentationName",
      payload: {
        uuid: selectedDocumentation.uuid,
        nodeUUID: selectedNode.uuid,
        name: event.target.value
      }
    });
  };

  const onSave = async () => {
    dispatch({ type: "saving", payload: true });
    forEach(selectedNode.documentations, ({ documentationItems }) =>
      forEach(documentationItems, item => {
        const { content, contentHtml } = convertEditorStateToRaw(item.editorState);
        item.content = content;
        item.contentHtml = contentHtml;
      })
    );
    const [response, error] = await api.saveDocumentation(selectedNode);
    if (error) {
      dispatch({ type: "saving", payload: false });
      alert(error);
      console.error(response);
    }
    dispatch({ type: "saving", payload: false });
  };

  const onDelete = async () => {
    if (window.confirm("Do you really want to delete this documentation?")) {
      dispatch({ type: "saving", payload: true });
      const error = await api.deleteDocumentation(selectedDocumentation.uuid);
      if (error) {
        dispatch({ type: "saving", payload: false });
        alert(error);
      } else {
        dispatch({ type: "delete", payload: { selectedDocumentation } });
        dispatch({ type: "saving", payload: false });
      }
    }
  };

  return (
    <Box border={1} borderColor={"#ddd"} p={2}>
      <Grid container item justify={"flex-end"}>
        <Button size="small" onClick={onDelete}>
          <DeleteIcon style={{ color: Colors.ValidationError }} />
        </Button>
      </Grid>
      <TextField
        id="node-name"
        variant="outlined"
        label={"Node Name"}
        onChange={onNodeNameChange}
        value={selectedNode.name}
        fullWidth
      />
      <Box mt={2} />
      <TextField
        id="doc-name"
        variant="outlined"
        label={"Documentation name"}
        onChange={onDocumentationNameChange}
        value={name}
        fullWidth
      />
      <Tabs value={value} onChange={(e, v) => setValue(v)}>
        {map(languages, locale => (
          <Tab key={locale} label={locale} />
        ))}
      </Tabs>
      {map(languages, (locale, index) =>
        renderDocumentItem(value, index, selectedDocumentation, locale)
      )}
      <SaveComponent name="save" onSubmit={onSave} styleClass={{ marginTop: "14px" }} />
      <Box mt={2} />
      {createdBy && (
        <Audit
          direction={"row"}
          createdDateTime={createdDateTime}
          lastModifiedDateTime={lastModifiedDateTime}
          createdBy={createdBy}
          lastModifiedBy={lastModifiedBy}
        />
      )}
    </Box>
  );
};
