import React from "react";
import { Editor, EditorState, convertFromRaw } from "draft-js";
import "draft-js/dist/Draft.css";
import { stateToHTML } from "draft-js-export-html";

let contentState = {
  blocks: [
    {
      key: "b0q5q",
      text: "",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: "df6bq",
      text: " ",
      type: "atomic",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [{ offset: 0, length: 1, key: 0 }],
      data: {}
    },
    {
      key: "e0645",
      text: "",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    }
  ],
  entityMap: {
    "0": {
      type: "image",
      mutability: "IMMUTABLE",
      data: { src: "file:///storage/emulated/0/OpenCHS/media/images/sc.png" }
    }
  }
};

const j = {
  blocks: [
    {
      key: "e8m6c",
      text: "hello there how are you?\nhi?",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [
        { offset: 6, length: 5, style: "BOLD" },
        { offset: 25, length: 3, style: "ITALIC" }
      ],
      entityRanges: [],
      data: {}
    },
    {
      key: "8habh",
      text: "what do you want?",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [{ offset: 8, length: 3, style: "UNDERLINE" }],
      entityRanges: [],
      data: {}
    },
    {
      key: "91mit",
      text: "adfasdf",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: "for9r",
      text: "asdfadsf",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [{ offset: 6, length: 2, style: "ITALIC" }],
      entityRanges: [],
      data: {}
    },
    {
      key: "b6ahf",
      text: " ",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [{ offset: 0, length: 1, key: 0 }],
      data: {}
    }
  ],
  entityMap: { "0": { type: "IMAGE", mutability: "MUTABLE", data: { src: "y.jx" } } }
};

export default function News() {
  const state = convertFromRaw(contentState);
  const [editorState, setEditorState] = React.useState(() => EditorState.createWithContent(state));

  console.log("html", stateToHTML(state));
  console.log("html2", stateToHTML(convertFromRaw(j)));
  return <Editor editorState={editorState} onChange={setEditorState} />;
}
