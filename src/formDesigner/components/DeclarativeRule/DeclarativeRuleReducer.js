import { Condition, Action, RHS, LHS, DeclarativeRule } from "rules-config";
import { isEmpty, forEach } from "lodash";

const resetState = () => {
  return new DeclarativeRule().getInitialState();
};

const newCondition = declarativeRule => {
  const newState = declarativeRule.clone();
  newState.addCondition(new Condition().getInitialCondition());
  return newState;
};

const newAction = declarativeRule => {
  const newState = declarativeRule.clone();
  newState.addAction(new Action());
  return newState;
};

const conditionConjunctionChange = (declarativeRule, { conjunction, index }) => {
  const newState = declarativeRule.clone();
  const condition = newState.conditions[index];
  const oldConjunction = condition.conjunction;
  condition.conjunction = oldConjunction === conjunction ? undefined : conjunction;
  return newState;
};

const compoundRuleConjunctionChange = (declarativeRule, { conjunction, conditionIndex }) => {
  const newState = declarativeRule.clone();
  const condition = newState.conditions[conditionIndex];
  condition.compoundRule.conjunction = conjunction;
  return newState;
};

const addNewRule = (declarativeRule, { conditionIndex }) => {
  const newState = declarativeRule.clone();
  const condition = newState.conditions[conditionIndex];
  condition.compoundRule.addEmptyRule();
  return newState;
};

const lhsChange = (declarativeRule, { ruleIndex, conditionIndex, property, value }) => {
  const newState = declarativeRule.clone();
  const condition = newState.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  if (property === "type" && rule.lhs.type !== value) {
    rule.lhs = new LHS();
  }
  rule.lhs[property] = value;
  rule.rhs = new RHS();
  rule.operator = undefined;
  return newState;
};

const lhsConceptChange = (declarativeRule, { ruleIndex, conditionIndex, name, uuid, dataType }) => {
  const newState = declarativeRule.clone();
  const condition = newState.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  rule.lhs.conceptName = name;
  rule.lhs.conceptUuid = uuid;
  rule.lhs.conceptDataType = dataType;
  return newState;
};

const rhsChange = (declarativeRule, { ruleIndex, conditionIndex, property, value }) => {
  const newState = declarativeRule.clone();
  const condition = newState.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  if (property === "type" && rule.rhs.type !== value) {
    rule.rhs = new RHS();
  }
  rule.rhs[property] = value;
  return newState;
};

const rhsConceptChange = (declarativeRule, { ruleIndex, conditionIndex, labelValues }) => {
  const newState = declarativeRule.clone();
  const condition = newState.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  const answerConceptNames = [];
  const answerConceptUuids = [];
  forEach(labelValues, ({ value }) => {
    answerConceptNames.push(value.name);
    answerConceptUuids.push(value.uuid);
  });
  rule.rhs.answerConceptNames = answerConceptNames;
  rule.rhs.answerConceptUuids = answerConceptUuids;
  return newState;
};

const operatorChange = (declarativeRule, { ruleIndex, conditionIndex, operator }) => {
  const newState = declarativeRule.clone();
  const condition = newState.conditions[conditionIndex];
  const rule = condition.compoundRule.rules[ruleIndex];
  rule.operator = operator;
  rule.rhs = new RHS();
  return newState;
};

const deleteCondition = (declarativeRule, { conditionIndex }) => {
  const newState = declarativeRule.clone();
  newState.conditions.splice(conditionIndex, 1);
  return newState;
};

const deleteRule = (declarativeRule, { ruleIndex, conditionIndex }) => {
  const newState = declarativeRule.clone();
  const condition = newState.conditions[conditionIndex];
  condition.compoundRule.rules.splice(ruleIndex, 1);
  return newState;
};

const actionChange = (declarativeRule, { index, property, value }) => {
  const newState = declarativeRule.clone();
  const oldAction = newState.actions[index];
  if (property === "actionType") {
    if (oldAction.actionType !== value) {
      newState.actions[index] = new Action();
    }
    if (isEmpty(oldAction.actionType)) {
      newState.addAction(new Action());
    }
  }
  const action = newState.actions[index];
  action[property] = value;
  return newState;
};

export const DeclarativeRuleReducer = (declarativeRule, action) => {
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
    resetState: resetState
  };
  const actionFn = actionFns[action.type] || (() => declarativeRule);
  const newState = actionFn(declarativeRule, action.payload);
  action.payload.updateProps(newState);
  return newState;
};
