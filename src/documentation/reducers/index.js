import { ModelGeneral as General } from "avni-models";
import { find, forEach, isEmpty, map, findIndex } from "lodash";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import DOMPurify from "dompurify";
import draftToHtml from "draftjs-to-html";

function setEditorState(documentations) {
  return forEach(documentations, ({ documentationItems }) =>
    forEach(documentationItems, item => {
      item.editorState = convertRawToEditorState(item.content);
    })
  );
}

export const DocumentationReducer = (state, action) => {
  const newState = { ...state };
  const { documentationNodes, expandedNodeUUIDs, languages } = newState;
  switch (action.type) {
    case "setData": {
      const { documentationNodes, languages } = action.payload;
      forEach(documentationNodes, ({ documentations, uuid }) => {
        expandedNodeUUIDs.push(uuid);
        setEditorState(documentations);
      });
      newState.documentationNodes = documentationNodes;
      newState.languages = languages;
      return newState;
    }
    case "newDocumentation": {
      const { nodeUUID } = action.payload;
      const selectedNode = find(documentationNodes, ({ uuid }) => uuid === nodeUUID);
      selectedNode.documentations.push(createNewDocumentation(nodeUUID, languages));
      return newState;
    }
    case "newNode": {
      const newNode = createNewNode(null, languages);
      expandedNodeUUIDs.push(newNode.uuid);
      documentationNodes.push(newNode);
      return newState;
    }
    case "nodeToggle": {
      newState.expandedNodeUUIDs = action.payload;
      return newState;
    }
    case "newDocumentationItem": {
      const { language, selectedDocumentation } = action.payload;
      const currentNode = find(
        documentationNodes,
        n => n.uuid === selectedDocumentation.documentationNodeUUID
      );
      const currentDocumentation = find(
        currentNode.documentations,
        d => d.uuid === selectedDocumentation.uuid
      );
      const newItem = createNewDocumentationItem(selectedDocumentation.uuid, language);
      currentDocumentation.documentationItems.push(newItem);
      return newState;
    }
    case "toggleDocumentation": {
      newState.selectedDocumentation = action.payload;
      return newState;
    }
    case "changeNodeName": {
      const { uuid, name } = action.payload;
      const currentNode = find(documentationNodes, n => n.uuid === uuid);
      currentNode.name = name;
      return newState;
    }
    case "changeDocumentationName": {
      const { uuid, name, nodeUUID } = action.payload;
      const currentNode = find(documentationNodes, n => n.uuid === nodeUUID);
      const currentDocumentation = find(currentNode.documentations, d => d.uuid === uuid);
      currentDocumentation.name = name;
      return newState;
    }
    case "editorState": {
      const { language, selectedDocumentation, editorState, documentationItem } = action.payload;
      const currentNode = find(
        documentationNodes,
        n => n.uuid === selectedDocumentation.documentationNodeUUID
      );
      const currentDocumentation = find(
        currentNode.documentations,
        d => d.uuid === selectedDocumentation.uuid
      );
      const currentDocumentationItem = find(
        currentDocumentation.documentationItems,
        i => i.uuid === documentationItem.uuid
      );
      currentDocumentationItem.editorState = editorState;
      currentDocumentationItem.language = language;
      return newState;
    }
    case "saving": {
      newState.saving = action.payload;
      return newState;
    }
    case "delete": {
      const { selectedDocumentation } = action.payload;
      const currentNode = find(
        documentationNodes,
        n => n.uuid === selectedDocumentation.documentationNodeUUID
      );
      const index = findIndex(
        currentNode.documentations,
        d => d.uuid === selectedDocumentation.uuid
      );
      currentNode.documentations.splice(index, 1);
      return newState;
    }
    default:
      return newState;
  }
};

export const initialState = {
  languages: [],
  expandedNodeUUIDs: [],
  selectedDocumentation: {},
  documentations: [],
  saving: false
};
const createNewNode = (parent, languages) => {
  const nodeUUID = General.randomUUID();
  return {
    uuid: nodeUUID,
    name: "New node",
    documentations: [createNewDocumentation(nodeUUID, languages)],
    parent: parent
  };
};
const createNewDocumentation = (nodeUUID, languages) => {
  const documentationUUID = General.randomUUID();
  const items = map(languages, l => createNewDocumentationItem(documentationUUID, l));
  return {
    uuid: documentationUUID,
    name: "New Documentation",
    documentationItems: items,
    documentationNodeUUID: nodeUUID
  };
};
const createNewDocumentationItem = (documentationUUID, language) => ({
  uuid: General.randomUUID(),
  content: "",
  contentHtml: "",
  editorState: EditorState.createEmpty(),
  language: language,
  documentationUUID: documentationUUID
});

const convertRawToEditorState = raw =>
  isEmpty(raw)
    ? EditorState.createEmpty()
    : EditorState.createWithContent(convertFromRaw(JSON.parse(raw)));

export const convertEditorStateToRaw = editorState => {
  const rawContent = convertToRaw(editorState.getCurrentContent());
  const content = JSON.stringify(rawContent);
  const contentHtml = DOMPurify.sanitize(draftToHtml(rawContent));
  return { content, contentHtml };
};
