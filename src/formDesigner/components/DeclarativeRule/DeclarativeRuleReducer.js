import { Condition, Action, RHS, LHS, DeclarativeRuleHolder } from "rules-config";
import { isEmpty, forEach, size } from "lodash";

const resetState = () => {
  return DeclarativeRuleHolder.fromResource();
};

const newCondition = (declarativeRuleHolder, { declarativeRuleIndex }) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  declarativeRule.addCondition(new Condition().getInitialCondition());
  return newState;
};

const newAction = (declarativeRuleHolder, { declarativeRuleIndex }) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  declarativeRule.addAction(new Action());
  return newState;
};

const conditionConjunctionChange = (
  declarativeRuleHolder,
  { declarativeRuleIndex, conjunction, index }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const condition = declarativeRule.conditions[index];
  const oldConjunction = condition.conjunction;
  condition.conjunction = oldConjunction === conjunction ? undefined : conjunction;
  return newState;
};

const compoundRuleConjunctionChange = (
  declarativeRuleHolder,
  { declarativeRuleIndex, conjunction, conditionIndex }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const condition = declarativeRule.conditions[conditionIndex];
  condition.compoundRule.conjunction = conjunction;
  return newState;
};

const addNewRule = (declarativeRuleHolder, { declarativeRuleIndex, conditionIndex }) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const condition = declarativeRule.conditions[conditionIndex];
  condition.compoundRule.addEmptyRule();
  return newState;
};

const lhsChange = (
  declarativeRuleHolder,
  { declarativeRuleIndex, ruleIndex, conditionIndex, property, value }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const condition = declarativeRule.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  if (property === "type" && rule.lhs.type !== value) {
    rule.lhs = new LHS();
  }
  rule.lhs[property] = value;
  rule.rhs = new RHS();
  rule.operator = undefined;
  return newState;
};

const lhsConceptChange = (
  declarativeRuleHolder,
  { declarativeRuleIndex, ruleIndex, conditionIndex, name, uuid, dataType }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const condition = declarativeRule.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  rule.lhs.conceptName = name;
  rule.lhs.conceptUuid = uuid;
  rule.lhs.conceptDataType = dataType;
  return newState;
};

const rhsChange = (
  declarativeRuleHolder,
  { declarativeRuleIndex, ruleIndex, conditionIndex, property, value }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const condition = declarativeRule.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  if (property === "type" && rule.rhs.type !== value) {
    rule.rhs = new RHS();
  }
  rule.rhs[property] = value;
  return newState;
};

const rhsConceptChange = (
  declarativeRuleHolder,
  { declarativeRuleIndex, ruleIndex, conditionIndex, labelValues }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const condition = declarativeRule.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  const { names, uuids } = getConceptNamesAndUUIDs(labelValues);
  rule.rhs.answerConceptNames = names;
  rule.rhs.answerConceptUuids = uuids;
  return newState;
};

const operatorChange = (
  declarativeRuleHolder,
  { declarativeRuleIndex, ruleIndex, conditionIndex, operator }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const condition = declarativeRule.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  rule.operator = operator;
  rule.rhs = new RHS();
  return newState;
};

const deleteCondition = (declarativeRuleHolder, { declarativeRuleIndex, conditionIndex }) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  declarativeRule.conditions.splice(conditionIndex, 1);
  return newState;
};

const deleteRule = (declarativeRuleHolder, { declarativeRuleIndex, ruleIndex, conditionIndex }) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const condition = declarativeRule.conditions[conditionIndex];
  condition.compoundRule.rules.splice(ruleIndex, 1);
  return newState;
};

const actionChange = (
  declarativeRuleHolder,
  { declarativeRuleIndex, index, property, value, types }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const oldAction = declarativeRule.actions[index];
  if (property === "actionType") {
    if (oldAction.actionType !== value) {
      declarativeRule.actions[index] = new Action();
    }
    if (isEmpty(oldAction.actionType) && size(types) > 1) {
      declarativeRule.addAction(new Action());
    }
    declarativeRule.actions[index].setActionType(value);
  } else {
    declarativeRule.actions[index].addDetails(property, value);
  }
  return newState;
};

const getConceptNamesAndUUIDs = labelValues => {
  const names = [];
  const uuids = [];
  forEach(labelValues, ({ value }) => {
    names.push(value.name);
    uuids.push(value.uuid);
  });
  return { names, uuids };
};

const answerToSkipChange = (
  declarativeRuleHolder,
  { declarativeRuleIndex, index, labelValues }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const action = declarativeRule.actions[index];
  const { names, uuids } = getConceptNamesAndUUIDs(labelValues);
  action.addDetails("answersToSkip", names);
  action.addDetails("answerUuidsToSkip", uuids);
  return newState;
};

const newDeclarativeRule = declarativeRuleHolder => {
  const newState = declarativeRuleHolder.clone();
  return newState.addEmptyDeclarativeRule();
};

const deleteDeclarativeRule = (declarativeRuleHolder, { declarativeRuleIndex }) => {
  const newState = declarativeRuleHolder.clone();
  newState.deleteAtIndex(declarativeRuleIndex);
  return newState;
};

const decisionConcept = (
  declarativeRuleHolder,
  { declarativeRuleIndex, index, name, uuid, dataType }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  declarativeRule.actions[index].addDetails("conceptName", name);
  declarativeRule.actions[index].addDetails("conceptUuid", uuid);
  declarativeRule.actions[index].addDetails("conceptDataType", dataType);
  return newState;
};

const decisionCodedValue = (
  declarativeRuleHolder,
  { declarativeRuleIndex, index, labelValues }
) => {
  const newState = declarativeRuleHolder.clone();
  const declarativeRule = newState.getDeclarativeRuleAtIndex(declarativeRuleIndex);
  const { names } = getConceptNamesAndUUIDs(labelValues);
  declarativeRule.actions[index].addDetails("value", names);
  return newState;
};

export const DeclarativeRuleReducer = (declarativeRuleHolder, action) => {
  const actionFns = {
    newCondition: newCondition,
    newAction: newAction,
    conditionConjunctionChange: conditionConjunctionChange,
    compoundRuleConjunctionChange: compoundRuleConjunctionChange,
    addNewRule: addNewRule,
    lhsChange: lhsChange,
    lhsConceptChange: lhsConceptChange,
    rhsChange: rhsChange,
    rhsConceptChange: rhsConceptChange,
    operatorChange: operatorChange,
    deleteCondition: deleteCondition,
    deleteRule: deleteRule,
    actionChange: actionChange,
    answerToSkipChange: answerToSkipChange,
    resetState: resetState,
    newDeclarativeRule: newDeclarativeRule,
    deleteDeclarativeRule: deleteDeclarativeRule,
    decisionConcept: decisionConcept,
    decisionCodedValue: decisionCodedValue
  };
  const actionFn = actionFns[action.type] || (() => declarativeRuleHolder);
  const newState = actionFn(declarativeRuleHolder, action.payload);
  action.payload.updateProps(newState);
  return newState;
};
