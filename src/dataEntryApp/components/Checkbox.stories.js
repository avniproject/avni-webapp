import Checkbox from "./Checkbox";

export default {
  title: "DEA/Components/Checkbox",
  component: Checkbox
};

const Template = args => <Checkbox {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  checked: true,
  color: "primary"
};
