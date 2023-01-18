import { get, isNil, reject } from "lodash";
import { TaskMetadata } from "../reducers/TaskAssignmentReducer";

export const getTableColumns = taskMetadata => {
  const metaSearchColumns = TaskMetadata.getAllSearchFields(taskMetadata).map(([name]) => {
    const column = {
      title: name,
      sorting: false,
      render: rowData => get(rowData, ["metadata", name])
    };
    column[name] = name;
    return column;
  });

  const columns = [
    {
      title: "Name",
      field: "name"
    },
    ...metaSearchColumns,
    {
      title: "Assigned To",
      field: "assignedTo",
      sorting: false
    },
    {
      title: "Status",
      field: "status",
      sorting: false
    },
    {
      title: "Created",
      field: "createdOn",
      sorting: false
    },
    {
      title: "Completed",
      field: "completedOn",
      sorting: false
    }
  ];
  return reject(columns, isNil);
};
