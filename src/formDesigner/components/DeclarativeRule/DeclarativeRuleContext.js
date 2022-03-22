import { createContext, useContext } from "react";
import { get } from "lodash";

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

export const getIsPerson = () => {
  const { subjectType } = useContext(DeclarativeRuleContext);
  return get(subjectType, "type") === "Person";
};

export const getFormType = () => {
  const { formType } = useContext(DeclarativeRuleContext);
  return formType;
};

export const getEncounterTypes = () => {
  const { encounterTypes } = useContext(DeclarativeRuleContext);
  return encounterTypes;
};

export const getForm = () => {
  const { form } = useContext(DeclarativeRuleContext);
  return form;
};

export const getParentConceptUuid = () => {
  const { parentConceptUuid } = useContext(DeclarativeRuleContext);
  return parentConceptUuid;
};
