import { convertFromRaw, EditorState } from "draft-js";
import { isEmpty } from "lodash";

export const NewsReducer = (news, action) => {
  switch (action.type) {
    case "title":
      return { ...news, title: action.payload };
    case "publishedDate":
      return { ...news, publishedDate: action.payload };
    case "heroImage":
      return { ...news, heroImage: action.payload };
    case "editorState":
      return { ...news, editorState: action.payload };
    case "setData":
      const convertRawToEditorState = raw =>
        EditorState.createWithContent(convertFromRaw(JSON.parse(raw)));
      const editorState = isEmpty(action.payload.content)
        ? EditorState.createEmpty()
        : convertRawToEditorState(action.payload.content);
      return {
        ...news,
        title: action.payload.title,
        publishedDate: action.payload.publishedDate,
        createdDateTime: action.payload.createdDateTime,
        heroImage: action.payload.heroImage,
        contentHtml: action.payload.contentHtml,
        content: action.payload.content,
        id: action.payload.id,
        editorState
      };
    case "reset":
      return newsInitialState;
    default:
      return news;
  }
};

export const newsInitialState = {
  title: "",
  publishedDate: null,
  heroImage: null,
  editorState: EditorState.createEmpty(),
  contentHtml: null
};
