import { useContext } from "react";
import DocumentationContext from "../context";

export const useDocumentationDispatch = () => {
  const { dispatch } = useContext(DocumentationContext);
  return dispatch;
};

export const getDocumentationState = () => {
  const { state } = useContext(DocumentationContext);
  return state;
};
