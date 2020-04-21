import { filter, isEmpty, isNil } from "lodash";

export const handleHouseholdChange = (event, state, dispatch) => {
  const checked = event.target.checked;
  dispatch({
    type: "household",
    payload: {
      group: checked || state.group,
      household: checked,
      groupRoles: []
    }
  });
};

export const handleGroupChange = (event, state, dispatch) => {
  const checked = event.target.checked;
  dispatch({
    type: "group",
    payload: { group: checked, groupRoles: checked ? state.groupRoles : [] }
  });
};

export const validateGroup = (groupRoles, setGroupValidationError) => {
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
  setGroupValidationError(emptyRoles.length > 0);
};
