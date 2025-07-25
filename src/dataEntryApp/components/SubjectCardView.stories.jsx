import SubjectCardView from "./SubjectCardView";

export default {
  component: SubjectCardView,
  title: "DEA/Components/SubjectCardView",
  parameters: {
    layout: "centered"
  }
};

const Template = args => <SubjectCardView {...args} />;

export const Person = Template.bind({});
Person.args = {
  uuid: "personUuid",
  name: "FirstName LastName",
  gender: "Female",
  age: 42,
  location: "LocationName"
};

export const NonPerson = Template.bind({});
NonPerson.args = {
  ...Person.args,
  name: "FirstName",
  gender: null,
  age: null,
  location: "LocationName"
};

export const Group = Template.bind({});
Group.args = {
  ...NonPerson.args,
  name: "GroupName"
};

export const Household = Template.bind({});
Household.args = {
  ...NonPerson.args,
  name: "HouseholdName"
};
