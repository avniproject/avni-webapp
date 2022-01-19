import { createContext, useContext } from "react";

const DeclarativeRuleContext = createContext();

export default DeclarativeRuleContext;

export const useDeclarativeRuleDispatch = () => {
  const { dispatch } = useContext(DeclarativeRuleContext);
  return dispatch;
};

export const useDeclarativeRuleState = () => {
  const { state } = useContext(DeclarativeRuleContext);
  return state;
};
