import React, { useEffect } from "react";
import MaterialTable from "material-table";
import { buildFilterData, filterDisplayColumns } from "../../../adminApp/CustomFilters";
import commonApi from "../../../common/service";

const filterDisplayColumns = [
  { title: "Name", field: "name" },
  { title: "Subject Type", render: rowData => rowData.filterConfig.subjectType.name },
  { title: "Filter Type", render: rowData => rowData.filterConfig.type },
  { title: "Widget", render: rowData => rowData.widget.type },
  { title: "Search Scope", field: "Scope" }
];

const ShowDashboardFilters = ({ filters, editAction, deleteAction }) => {
  const [subjectTypes, setSubjectTypes] = React.useState([]);

  useEffect(() => {
    const fetchSubjectTypes = async () => setSubjectTypes(await commonApi.fetchSubjectTypes());
    fetchSubjectTypes();
    return () => {};
  }, []);

  return (
    <MaterialTable
      columns={filterDisplayColumns}
      data={filters && buildFilterData(filters.map(f => f.filter), subjectTypes)}
      options={{ search: false, paging: false, toolbar: false }}
      actions={
        editAction || deleteAction
          ? [
              editAction && {
                icon: "edit",
                tooltip: "Edit",
                onClick: (event, filter) => {
                  editAction(filter);
                }
              },
              deleteAction && {
                icon: "delete",
                tooltip: "Delete",
                onClick: (event, filter) => {
                  deleteAction(filter);
                }
              }
            ]
          : []
      }
    />
  );
};

export default ShowDashboardFilters;
