import GroupSubjectMemberCardView from "./GroupSubjectMemberCardView";
import { GroupSubject, Individual, GroupRole } from "avni-models";

export default {
  component: GroupSubjectMemberCardView,
  title: "DEA/Components/GroupSubjectMemberCardView",
  parameters: {
    layout: "centered"
  }
};

const Template = args => <GroupSubjectMemberCardView {...args} />;

const nonHouseholdGroupSubject = GroupSubject.createEmptyInstance();
const nonPerson = Individual.createEmptySubjectInstance();
const nonPersonGroupRole = GroupRole.createEmptyInstance();
nonPersonGroupRole.role = "NonHouseholdRoleName";
nonPerson.uuid = "NonHouseholdMemberUuid";
nonPerson.firstName = "FirstName";
nonPerson.subjectType.type = "Individual";
nonPerson.lowestAddressLevel.name = "Address";
nonHouseholdGroupSubject.memberSubject = nonPerson;
nonHouseholdGroupSubject.groupRole = nonPersonGroupRole;

export const NonHouseholdMember = Template.bind({});
NonHouseholdMember.args = {
  groupSubject: nonHouseholdGroupSubject
};

const householdGroupSubject = GroupSubject.createEmptyInstance();
const person = Individual.createEmptyInstance();
person.gender.name = "Female";
const personGroupRole = GroupRole.createEmptyInstance();
personGroupRole.role = "Household Member";
person.uuid = "HouseholdMemberUuid";
person.firstName = "FirstName";
person.lastName = "LastName";
person.subjectType.type = "Person";
person.lowestAddressLevel.name = "Address";
person.dateOfBirth = new Date("2000-01-01");
householdGroupSubject.memberSubject = person;
householdGroupSubject.groupRole = personGroupRole;

export const HouseholdMember = Template.bind({});
HouseholdMember.args = {
  groupSubject: householdGroupSubject
};
