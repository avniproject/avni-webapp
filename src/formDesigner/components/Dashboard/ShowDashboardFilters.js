import React from "react";
import MaterialTable from "material-table";
import _ from "lodash";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/DeleteOutline";
import materialTableIcons from "../../../common/material-table/MaterialTableIcons";
import EntityService from "../../../common/service/EntityService";

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
      title: "Subject Type",
      render: rowData => {
        const subjectType =
          rowData.filterConfig.subjectType &&
          EntityService.findByUuid(operationalModules.subjectTypes, rowData.filterConfig.subjectType.uuid);
        return subjectType ? subjectType.name : "";
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
  if (!filters) return null;

  const activeFilters = filters.filter(filter => !filter.voided);

  const handleDeleteFilter = filter => {
    const updatedFilter = { ...filter, voided: false };
    deleteAction(updatedFilter);
  };
  return (
    <MaterialTable
      icons={materialTableIcons}
      columns={getFilterColumns(operationalModules)}
      data={activeFilters}
      options={{ search: false, paging: false, toolbar: false }}
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
                  handleDeleteFilter(filter);
                }
              }
            ]
          : []
      }
    />
  );
};

export default ShowDashboardFilters;
