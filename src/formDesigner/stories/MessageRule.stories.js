import React from "react";
import MessageRule from "../components/MessageRule/MessageRule";

export default {
  component: MessageRule,
  title: "formDesigner/components/MessageRule"
};

const Template = args => <MessageRule {...args} />;
export const NormalMessageRule = Template.bind({});
export const ReadOnlyMessageRule = Template.bind({});
ReadOnlyMessageRule.args = {
  readOnly: true
};
