import { styled } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MaterialReactTable } from "material-react-table";
import { formatDateTime } from "../../utils/General";
import { formatMsgTemplate } from "../utils";
import MaterialTableIcons from "../../material-table/MaterialTableIcons";

const InfoMsg = styled(Typography)({
  marginLeft: 10
});

const YetToBeSentMessagesTable = ({
  msgsYetToBeSent,
  isMsgsNotYetSentAvailable
}) => {
  const { t } = useTranslation();

  const columns = [
    {
      accessorKey: "createdBy",
      header: t("sender"),
      Cell: ({ row }) => row.original.createdBy || ""
    },
    {
      accessorKey: "messageTemplateBody",
      header: t("messageTemplateBody"),
      Cell: ({ row }) =>
        row.original.messageTemplate?.body
          ? formatMsgTemplate(
              row.original.messageTemplate.body,
              row.original.messageRuleParams
            )
          : "",
      muiTableBodyCellProps: {
        sx: { minWidth: 200, maxWidth: 550 }
      }
    },
    {
      accessorKey: "scheduledDateTime",
      header: t("scheduledAt"),
      Cell: ({ row }) =>
        row.original.scheduledDateTime
          ? formatDateTime(row.original.scheduledDateTime)
          : "",
      sortingFn: "datetime",
      sortDescFirst: true
    }
  ];

  const renderNoMsgsYetToBeSent = () => (
    <InfoMsg variant="caption" gutterBottom>
      {t("noMessagesYetToBeSent")}
    </InfoMsg>
  );

  const renderTable = () => (
    <MaterialReactTable
      columns={columns}
      data={msgsYetToBeSent || []}
      icons={MaterialTableIcons}
      getRowId={row => row.id || row.uuid} // Ensure unique row IDs
      initialState={{
        pagination: { pageSize: 10, pageIndex: 0 },
        density: "compact",
        sorting: [{ id: "scheduledDateTime", desc: true }] // Default sort
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
        isLoading: !msgsYetToBeSent // Handle loading state
      }}
    />
  );

  return (
    <Box sx={{ position: "relative" }}>
      {isMsgsNotYetSentAvailable ? renderTable() : renderNoMsgsYetToBeSent()}
    </Box>
  );
};

export default YetToBeSentMessagesTable;
