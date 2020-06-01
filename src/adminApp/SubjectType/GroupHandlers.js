import { filter, isEmpty, isNil } from "lodash";

export const validateGroup = groupRoles => {
  const emptyRoles = filter(
    groupRoles,
    ({ role, subjectMemberName, minimumNumberOfMembers, maximumNumberOfMembers }) =>
      isEmpty(role) ||
      isEmpty(subjectMemberName) ||
      isNil(minimumNumberOfMembers) ||
      isNil(maximumNumberOfMembers) ||
      minimumNumberOfMembers === 0 ||
      maximumNumberOfMembers === 0
  );
  return emptyRoles.length > 0;
};
