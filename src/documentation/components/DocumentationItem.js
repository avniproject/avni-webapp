import { useEffect } from "react";
import { getDocumentationState, useDocumentationDispatch } from "../hooks";
import RichTextEditor from "../../news/components/RichTextEditor";
import { isEmpty } from "lodash";
import { Box } from "@mui/material";

export const DocumentationItem = ({ documentationItem, language }) => {
  const { selectedDocumentation } = getDocumentationState();
  const dispatch = useDocumentationDispatch();

  useEffect(() => {
    if (isEmpty(documentationItem)) {
      dispatch({
        type: "newDocumentationItem",
        payload: { language, documentationUUID: selectedDocumentation.uuid }
      });
    }
  }, []);

  return documentationItem ? (
    <div>
      <Box
        sx={{
          border: 1,
          mt: 2,
          borderColor: "#ddd",
          p: 2
        }}
      >
        <RichTextEditor
          editorState={documentationItem.editorState}
          setEditorState={editorState =>
            dispatch({
              type: "editorState",
              payload: {
                language,
                selectedDocumentation,
                documentationItem,
                editorState
              }
            })
          }
          wrapperClassName={{ width: 100 }}
        />
      </Box>
    </div>
  ) : null;
};
