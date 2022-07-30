import { flatMap, get, isNil, map, reject } from "lodash";

export const getTableColumns = ({ taskTypes }) => {
  const metaSearchColumns = flatMap(taskTypes, ({ metadataSearchFields }) =>
    map(metadataSearchFields, field => ({
      title: field,
      field,
      sorting: false,
      render: rowData => get(rowData, ["metadata", field])
    }))
  );

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
