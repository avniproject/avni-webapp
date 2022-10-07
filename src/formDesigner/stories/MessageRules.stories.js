import React, { useState } from "react";
import MessageRules from "../components/MessageRule/MessageRules";

export default {
  component: MessageRules,
  title: "formDesigner/components/MessageRules"
};

const WithInitialRule = (initialRules, readOnly) => () => {
  const [rules, setRules] = useState(initialRules);
  return <MessageRules rules={rules} onChange={setRules} readOnly={readOnly} />;
};

export const Empty = WithInitialRule();

const singleRule = [
  {
    scheduleRule: "() => {console.log('hello'}",
    messageRule: "() => console.log('This is a message Rule')",
    voided: false
  }
];
export const SingleRule = WithInitialRule(singleRule);

const twoRules = [
  {
    scheduleRule: "() => {console.log('hello'}",
    messageRule: "() => console.log('This is a message Rule')",
    voided: false
  },
  {
    scheduleRule: "() => {console.log('hello'}",
    messageRule: "() => console.log('This is a message Rule')",
    voided: false
  }
];
export const TwoRules = WithInitialRule(twoRules);

export const ReadOnly = WithInitialRule(singleRule, true);
