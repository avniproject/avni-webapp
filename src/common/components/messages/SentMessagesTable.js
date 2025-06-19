import React from "react";
import { styled } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MaterialReactTable } from "material-react-table"; // Correct import
import { formatDateTime } from "../../utils/General";
import MaterialTableIcons from "../../material-table/MaterialTableIcons";

const InfoMsg = styled(Typography)(({ theme }) => ({
  marginLeft: 10
}));

const SentMessagesTable = ({ sentMessages, isMsgsSentAvailable }) => {
  const { t } = useTranslation();

  const columns = [
    {
      accessorKey: "body",
      header: t("msgBody"),
      muiTableBodyCellProps: {
        sx: { minWidth: 200, maxWidth: 550 }
      }
    },
    {
      accessorKey: "insertedAt",
      header: t("insertedAt"),
      Cell: ({ cell }) => (cell.getValue() ? formatDateTime(cell.getValue()) : "-"),
      sortingFn: "datetime",
      sortDescFirst: true
    }
  ];

  const renderNoSentMessages = () => (
    <InfoMsg variant="caption" gutterBottom>
      {t("noSentMessages")}
    </InfoMsg>
  );

  const renderTable = () => (
    <MaterialReactTable
      columns={columns}
      data={sentMessages || []}
      icons={MaterialTableIcons}
      getRowId={row => row.id || row.uuid} // Ensure unique row IDs
      initialState={{
        pagination: { pageSize: 10, pageIndex: 0 },
        density: "compact",
        sorting: [{ id: "insertedAt", desc: true }] // Default sort
      }}
      muiTableProps={{
        sx: {
          "& .MuiTableHead-root": { zIndex: 1 }
        }
      }}
      muiTablePaginationProps={{
        rowsPerPageOptions: [10, 15, 20]
      }}
      enableSorting
      enableGlobalFilter={false}
      enableColumnFilters={false}
      enableTopToolbar={false}
      state={{
        isLoading: !sentMessages // Handle loading state
      }}
    />
  );

  return <Box sx={{ position: "relative" }}>{isMsgsSentAvailable ? renderTable() : renderNoSentMessages()}</Box>;
};

export default SentMessagesTable;
