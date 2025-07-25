import { CodedFormElement } from "./CodedFormElement";

export default {
  title: "DEA/Components/CodedFormElement",
  component: CodedFormElement,
  argTypes: {
    onChange: { action: "Selected" }
  }
};

const Template = args => <CodedFormElement {...args} />;

const isChecked = item => item.uuid === "first-item-uuid";
const items = [
  {
    uuid: "first-item-uuid",
    name: "first choice"
  },
  {
    uuid: "second-item-uuid",
    name: "second choice"
  },
  {
    uuid: "third-item-uuid",
    name: "third choice"
  }
];

export const MultiSelect = Template.bind({});
MultiSelect.args = {
  name: "Choose among the following",
  items: items,
  isChecked,
  multiSelect: true,
  mandatory: true,
  validationResults: [],
  uuid: "uuid-uuid-uuid",
  errorMsg: null
};

export const SingleSelect = Template.bind({});
SingleSelect.args = {
  ...MultiSelect.args,
  multiSelect: false
};

export const SingleSelectWithError = Template.bind({});
SingleSelectWithError.args = {
  ...MultiSelect.args,
  errorMsg: "This is an error message"
};
