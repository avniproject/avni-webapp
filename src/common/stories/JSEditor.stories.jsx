import { JSEditor } from "../components/JSEditor";

export default {
  component: JSEditor,
  title: "common/components/JSEditor"
};

export const EmptyCode = args => <JSEditor {...args} />;
EmptyCode.args = {};

export const WithContent = args => <JSEditor {...args} />;
WithContent.args = {
  value: '() => {console.log("Hello World")}'
};
