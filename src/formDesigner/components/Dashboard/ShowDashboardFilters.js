import React from "react";
import MaterialTable from "material-table";
import _ from "lodash";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/DeleteOutline";
import materialTableIcons from "../../../common/material-table/MaterialTableIcons";

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
      icons={materialTableIcons}
      columns={getFilterColumns(operationalModules)}
      data={filters}
      options={{
        headerStyle: {
          zIndex: 1
        },
        search: false,
        paging: false,
        toolbar: false
      }}
      actions={
        editAction || deleteAction
          ? [
              editAction && {
                icon: () => <Edit />,
                tooltip: "Edit",
                onClick: (event, filter) => {
                  editAction(filter);
                }
              },
              deleteAction && {
                icon: () => <Delete />,
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
