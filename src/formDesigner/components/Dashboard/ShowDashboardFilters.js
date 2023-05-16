import React from "react";
import MaterialTable from "material-table";
import _ from "lodash";

function getFilterColumns(operationalModules) {
  if (_.isNil(operationalModules.subjectTypes)) return [];

  return [
    {
      title: "Name",
      render: rowData => {
        return rowData.name;
      }
    },
    {
      title: "Filter Type",
      render: rowData => {
        return rowData.filterConfig.type;
      }
    }
  ];
}

const ShowDashboardFilters = ({ filters, editAction, deleteAction, operationalModules }) => {
  return (
    <MaterialTable
      columns={getFilterColumns(operationalModules)}
      data={filters}
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
