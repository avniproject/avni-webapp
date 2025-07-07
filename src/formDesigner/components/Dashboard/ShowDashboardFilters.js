import { useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import _ from "lodash";
import { IconButton, Box } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import EntityService from "../../../common/service/EntityService";

const ShowDashboardFilters = ({ filters, editAction, deleteAction, operationalModules }) => {
  const columns = useMemo(() => {
    if (_.isNil(operationalModules?.subjectTypes)) return [];

    return [
      {
        id: "name",
        header: "Name",
        Cell: ({ row }) => row.original.name
      },
      {
        id: "subjectType",
        header: "Subject Type",
        Cell: ({ row }) => {
          const subjectType =
            row.original.filterConfig?.subjectType &&
            EntityService.findByUuid(operationalModules.subjectTypes, row.original.filterConfig.subjectType.uuid);
          return subjectType ? subjectType.name : "";
        }
      },
      {
        id: "filterType",
        header: "Filter Type",
        Cell: ({ row }) => row.original.filterConfig?.type
      }
    ];
  }, [operationalModules]);

  return (
    <MaterialReactTable
      columns={columns}
      data={filters || []}
      enablePagination={false}
      enableGlobalFilter={false}
      enableColumnFilters={false}
      enableTopToolbar={false}
      enableRowActions={editAction || deleteAction}
      renderRowActions={({ row }) => (
        <Box sx={{ display: "flex", gap: "8px" }}>
          {editAction && (
            <IconButton onClick={() => editAction(row.original)} title="Edit">
              <Edit />
            </IconButton>
          )}
          {deleteAction && (
            <IconButton onClick={() => deleteAction(row.original)} title="Delete">
              <Delete />
            </IconButton>
          )}
        </Box>
      )}
      muiTableHeadCellProps={{
        sx: {
          zIndex: 1
        }
      }}
    />
  );
};

export default ShowDashboardFilters;
