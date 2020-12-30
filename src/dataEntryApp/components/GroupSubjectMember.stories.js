import React from "react";
import GroupSubjectMember from "./GroupSubjectMember";

export default {
  component: GroupSubjectMember,
  title: "DEA/Components/GroupSubjectMember"
};

const Template = args => <GroupSubjectMember {...args} />;

export const NonHouseholdMember = Template.bind({});
NonHouseholdMember.args = {
  groupSubjectMember: {
    role: "NonHouseholdRoleName",
    name: "FirstName",
    gender: null,
    age: null,
    location: "LocationName",
    relation: "RelationName"
  }
};

export const HouseholdMember = Template.bind({});
HouseholdMember.args = {
  groupSubjectMember: {
    role: "HouseholdRoleName",
    name: "FirstName LastName",
    gender: "Female",
    age: 42,
    location: "LocationName",
    relation: "RelationName"
  }
};
