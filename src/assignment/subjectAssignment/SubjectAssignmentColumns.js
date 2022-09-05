import { split, map, groupBy, forEach, isEmpty } from "lodash";

export const getColumns = () => {
  return [
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
