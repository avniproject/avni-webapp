import { ModelGeneral as General } from "avni-models";
import { filter, find, findIndex, forEach, isEmpty, isNil, map } from "lodash";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import DOMPurify from "dompurify";
import draftToHtml from "draftjs-to-html";

function setEditorState(documentationItems) {
  return forEach(documentationItems, item => {
    item.editorState = convertRawToEditorState(item.content);
  });
}

export const DocumentationReducer = (state, action) => {
  const newState = { ...state };
  const { documentations, languages } = newState;
  switch (action.type) {
    case "setData": {
      const { documentations, languages, documentationUUID } = action.payload;
      forEach(documentations, ({ uuid, documentationItems }) => {
        setEditorState(documentationItems);
      });
      newState.documentations = documentations;
      newState.languages = languages;
      if (documentationUUID) {
        newState.selectedDocumentation = find(
          newState.documentations,
          ({ uuid }) => uuid === documentationUUID
        );
      }
      return newState;
    }
    case "newDocumentation": {
      const { parent } = action.payload;
      const newDocumentation = createNewDocumentation(languages, parent);
      documentations.push(newDocumentation);
      return newState;
    }
    case "newDocumentationItem": {
      const { language, documentationUUID } = action.payload;
      const currentDocumentation = find(
        documentations,
        d => d.uuid === documentationUUID
      );
      const newItem = createNewDocumentationItem(documentationUUID, language);
      if (isNil(currentDocumentation.documentationItems)) {
        currentDocumentation.documentationItems = [];
      }
      currentDocumentation.documentationItems.push(newItem);
      return newState;
    }
    case "toggleDocumentation": {
      newState.selectedDocumentation = action.payload;
      return newState;
    }
    case "changeDocumentationName": {
      const { uuid, name } = action.payload;
      const currentDocumentation = find(documentations, d => d.uuid === uuid);
      currentDocumentation.name = name;
      return newState;
    }
    case "editorState": {
      const {
        language,
        selectedDocumentation,
        editorState,
        documentationItem
      } = action.payload;
      const currentDocumentation = find(
        documentations,
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
      const { uuid } = action.payload;
      const index = findIndex(documentations, d => d.uuid === uuid);
      documentations.splice(index, 1);
      newState.selectedDocumentation = {};
      return newState;
    }
    default:
      return newState;
  }
};

export const initialState = {
  languages: [],
  selectedDocumentation: {},
  documentations: [],
  saving: false
};

const createNewDocumentation = (languages, parent) => {
  const documentationUUID = General.randomUUID();
  const items = map(languages, l =>
    createNewDocumentationItem(documentationUUID, l)
  );
  return {
    uuid: documentationUUID,
    name: "New Documentation",
    documentationItems: items,
    parent: parent
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

const convertEditorStateToRaw = editorState => {
  const rawContent = convertToRaw(editorState.getCurrentContent());
  const content = JSON.stringify(rawContent);
  const contentHtml = DOMPurify.sanitize(draftToHtml(rawContent));
  return { content, contentHtml };
};

export const cloneForSave = documentation => {
  if (documentation) {
    const newDocumentation = {};
    newDocumentation.uuid = documentation.uuid;
    newDocumentation.name = documentation.name;
    const validItems = filter(
      documentation.documentationItems,
      item =>
        !isEmpty(item.editorState) &&
        item.editorState.getCurrentContent().hasText()
    );
    newDocumentation.documentationItems = map(
      validItems,
      cloneItemWithoutEditorState
    );
    newDocumentation.parent = cloneForSave(documentation.parent);
    return newDocumentation;
  }
};

const cloneItemWithoutEditorState = (item = {}) => {
  const newItem = {};
  const { content, contentHtml } = convertEditorStateToRaw(item.editorState);
  newItem.uuid = item.uuid;
  newItem.content = content;
  newItem.contentHtml = contentHtml;
  newItem.language = item.language;
  newItem.documentationUUID = item.documentationUUID;
  return newItem;
};
