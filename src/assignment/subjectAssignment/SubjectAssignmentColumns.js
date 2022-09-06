import { split, map, groupBy, forEach, isEmpty, isNil } from "lodash";
import { getSyncAttributes } from "../reducers/SubjectAssignmentReducer";

export const getColumns = (metadata, filterCriteria) => {
  const { syncAttribute1, syncAttribute2 } = getSyncAttributes(metadata, filterCriteria);
  const fixedColumns = [
    {
      title: "Name",
      field: "fullName"
    },
    {
      title: "Address",
      field: "addressLevel"
    },
    {
      title: "Program",
      field: "programs"
    },
    {
      title: "Assignment",
      render: row => getFormattedUserAndGroups(row.assignedTo)
    }
  ];
  addSyncAttributeColumnIfRequired(syncAttribute1, fixedColumns);
  addSyncAttributeColumnIfRequired(syncAttribute2, fixedColumns);

  return fixedColumns;
};

const addSyncAttributeColumnIfRequired = (syncAttribute, fixedColumns) => {
  if (!isNil(syncAttribute)) {
    fixedColumns.push({
      title: syncAttribute.name,
      field: syncAttribute.name
    });
  }
};

const getFormattedUserAndGroups = (userGroupString = "") => {
  if (isEmpty(userGroupString)) return "";
  const userGroupArray = map(split(userGroupString, ", "), ug => {
    const userAndGroup = split(ug, ":");
    return { user: userAndGroup[0], group: userAndGroup[1] };
  });
  const results = [];
  forEach(groupBy(userGroupArray, "user"), (v, k) =>
    results.push(`${k} (${map(v, ({ group }) => group).join(", ")})`)
  );
  return results.join(", ");
};
