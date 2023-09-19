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
      field: "assignedTo"
    },
    {
      title: "Status",
      field: "taskStatus"
    },
    {
      title: "Created",
      field: "createdDateTime"
    },
    {
      title: "Scheduled",
      field: "scheduledOn"
    },
    {
      title: "Completed",
      field: "completedOn"
    }
  ];
  return reject(columns, isNil);
};
