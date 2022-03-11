import { createContext, useContext } from "react";

const FormDesignerContext = createContext();

export default FormDesignerContext;

export const useSetFormState = () => {
  const { setState } = useContext(FormDesignerContext);
  return setState;
};

export const getFormState = () => {
  const { state } = useContext(FormDesignerContext);
  return state;
};
