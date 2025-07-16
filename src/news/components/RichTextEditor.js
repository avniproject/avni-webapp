import React from "react";
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import validator from "validator";

const RichTextEditor = ({ editorState, setEditorState }) => {
  const handleEditorChange = state => {
    const rawContent = convertToRaw(state.getCurrentContent());
    let hasInvalidLink = false;

    if (rawContent.entityMap) {
      Object.values(rawContent.entityMap).forEach(entity => {
        if (entity.type === "LINK") {
          const url = entity.data.url.trim();

          // Handle mailto links specially
          if (url.startsWith("mailto:")) {
            const emailPart = url.substring(7);
            if (!validator.isEmail(emailPart.trim())) {
              hasInvalidLink = true;
            }
          }
          // For other URLs use standard URL validation
          else if (
            !validator.isURL(url, {
              protocols: ["http", "https", "ftp", "ftps", "file"],
              require_protocol: true
            })
          ) {
            hasInvalidLink = true;
          }
        }
      });
    }

    if (hasInvalidLink) {
      alert(`Invalid URL format detected. Please check:
- Web links must start with http:// or https://
- Email links must use mailto:user@example.com (no space after colon)`);
      return;
    }

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
          options: ["Normal", "H1", "H2", "H3", "H4", "H5", "H6", "Blockquote"]
        }
      }}
    />
  );
};

export default RichTextEditor;
