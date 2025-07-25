import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { MaterialReactTable } from "material-react-table";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { formatDateTime } from "../../utils/General";
import { formatMsgTemplate } from "../utils";
import MaterialTableIcons from "../../material-table/MaterialTableIcons";

const StyledAccordion = styled(Accordion)({
  marginBottom: "11px",
  borderRadius: "5px",
  boxShadow:
    "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
});

const ExpansionHeading = styled(Typography)({
  fontSize: "1rem",
  flexBasis: "33.33%",
  flexShrink: 0,
  fontWeight: "500",
  margin: "0"
});

const ExpandMoreIcon = styled(ExpandMore)({
  color: "#0e6eff"
});

const GroupMessagesTable = ({ messages, title, showDeliveryDetails }) => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
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
        accessorKey: showDeliveryDetails
          ? "deliveredDateTime"
          : "scheduledDateTime",
        header: t(showDeliveryDetails ? "insertedAt" : "scheduledAt"),
        Cell: ({ row }) =>
          row.original[
            showDeliveryDetails ? "deliveredDateTime" : "scheduledDateTime"
          ]
            ? formatDateTime(
                row.original[
                  showDeliveryDetails
                    ? "deliveredDateTime"
                    : "scheduledDateTime"
                ]
              )
            : "",
        sortingFn: "datetime",
        sortDescFirst: true
      }
    ],
    [t, showDeliveryDetails]
  );

  return (
    <StyledAccordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <ExpansionHeading component="span">{t(title)}</ExpansionHeading>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0, display: "block" }}>
        <MaterialReactTable
          columns={columns}
          data={messages || []}
          icons={MaterialTableIcons}
          getRowId={row => row.id || row.uuid} // Ensure unique row IDs
          initialState={{
            pagination: { pageSize: 10, pageIndex: 0 },
            density: "compact",
            sorting: [
              {
                id: showDeliveryDetails
                  ? "deliveredDateTime"
                  : "scheduledDateTime",
                desc: true
              }
            ]
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
            isLoading: !messages
          }}
        />
      </AccordionDetails>
    </StyledAccordion>
  );
};

export default GroupMessagesTable;
