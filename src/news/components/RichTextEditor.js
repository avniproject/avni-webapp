import React from "react";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const RichTextEditor = ({ editorState, setEditorState }) => {
  const handleEditorChange = state => {
    setEditorState(state);
  };

  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={handleEditorChange}
      wrapperClassName="wrapper-class"
      editorClassName="editor-class"
      toolbarClassName="toolbar-class"
      toolbar={{
        options: ["inline", "blockType", "fontSize", "list", "colorPicker", "link", "history"],
        blockType: {
          inDropdown: true,
          options: ["Normal", "H1", "H2", "H3", "H4", "H5", "H6", "Blockquote"],
          className: undefined,
          component: undefined,
          dropdownClassName: undefined
        }
      }}
    />
  );
};
export default RichTextEditor;
