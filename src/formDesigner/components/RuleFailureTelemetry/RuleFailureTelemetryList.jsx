import { useCallback, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Grid, Button } from "@mui/material";
import { Title } from "react-admin";
import { httpClient as http } from "common/utils/httpClient";
import { format, isValid } from "date-fns";
import ButtonGroup from "@mui/material/ButtonGroup";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import Checkbox from "@mui/material/Checkbox";
import RuleFailureToolbar from "./RuleFailureToolbar";

export const STATUS = {
  OPEN: 1,
  CLOSED: 2,
  ALL: 3,
};

const RuleFailureTelemetryList = () => {
  const userInfo = useSelector((state) => state.app.userInfo);
  const isChatOpen = useSelector((state) => state.app.isChatOpen);
  const [selectedStatus, setSelectedStatus] = useState(STATUS.OPEN);
  const [selectedRows, setSelectedRows] = useState([]);
  const tableRef = useRef(null);

  const onSelect = useCallback((status) => {
    setSelectedStatus(status);
    setSelectedRows([]);
    if (tableRef.current) {
      tableRef.current.refresh({ page: 0 });
    }
  }, []);

  const toggleRowSelection = useCallback((row) => {
    setSelectedRows((prev) => {
      const id = row.original?.id || row.id;
      const newSelection = prev.some((r) => (r.original?.id || r.id) === id)
        ? prev.filter((r) => (r.original?.id || r.id) !== id)
        : [...prev, row];
      console.log("Toggle selection:", newSelection, "Row:", row);
      return newSelection;
    });
  }, []);

  const renderTopToolbar = useCallback(
    ({ table }) =>
      UserInfo.hasPrivilege(
        userInfo,
        Privilege.PrivilegeType.EditRuleFailure,
      ) ? (
        <RuleFailureToolbar
          tableRef={tableRef}
          selectedRows={selectedRows}
          selectedStatus={selectedStatus}
          onSelectionChange={setSelectedRows}
        />
      ) : undefined,
    [selectedRows, selectedStatus, userInfo],
  );

  const components = useMemo(
    () => ({
      topToolbar: renderTopToolbar,
    }),
    [renderTopToolbar],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "select",
        header: "",
        enableSorting: false,
        size: 50, // Reduced column width
        Cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.some(
              (r) => (r.original?.id || r.id) === (row.original?.id || row.id),
            )}
            onChange={() => toggleRowSelection(row)}
          />
        ),
      },
      {
        accessorKey: "errorMessage",
        header: "Message",
        enableSorting: true,
        size: 200, // Reduced column width
        Cell: ({ row }) => row.original.errorMessage || "-",
      },
      {
        accessorKey: "closed",
        header: "Status",
        enableSorting: true,
        size: 80, // Reduced column width
        Cell: ({ row }) => (row.original.closed ? "Closed" : "Open"),
      },
      {
        accessorKey: "errorDateTime",
        header: "Error Date",
        enableSorting: true,
        size: 120, // Reduced column width
        Cell: ({ row }) =>
          isValid(new Date(row.original.errorDateTime))
            ? format(new Date(row.original.errorDateTime), "yyyy-MM-dd HH:mm")
            : "-",
      },
      {
        accessorKey: "closedDateTime",
        header: "Closed Date",
        enableSorting: true,
        size: 120, // Reduced column width
        Cell: ({ row }) =>
          row.original.closedDateTime &&
          isValid(new Date(row.original.closedDateTime))
            ? format(new Date(row.original.closedDateTime), "yyyy-MM-dd HH:mm")
            : "-",
      },
      {
        accessorKey: "individualUuid",
        header: "Individual UUID",
        enableSorting: true,
        size: 150, // Reduced column width
        Cell: ({ row }) => row.original.individualUuid || "-",
      },
      {
        accessorKey: "ruleUuid",
        header: "Rule UUID",
        enableSorting: true,
        size: 150, // Reduced column width
        Cell: ({ row }) => row.original.ruleUuid || "-",
      },
      {
        accessorKey: "sourceId",
        header: "Source",
        enableSorting: true,
        size: 120, // Reduced column width
        Cell: ({ row }) => (
          <>
            <span>{row.original.sourceId || ""}</span>
            <b>
              {row.original.sourceType ? ` (${row.original.sourceType})` : ""}
            </b>
          </>
        ),
      },
      {
        accessorKey: "entityId",
        header: "Entity",
        enableSorting: true,
        size: 120, // Reduced column width
        Cell: ({ row }) => (
          <>
            <span>{row.original.entityId || ""}</span>
            <b>
              {row.original.entityType ? ` (${row.original.entityType})` : ""}
            </b>
          </>
        ),
      },
      {
        accessorKey: "appType",
        header: "App",
        enableSorting: true,
        size: 100, // Reduced column width
        Cell: ({ row }) => row.original.appType || "-",
      },
    ],
    [selectedRows, toggleRowSelection],
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection }) =>
      new Promise((resolve) => {
        const resourceUrl = "/web/ruleFailureTelemetry";
        const queryParams = {
          size: pageSize,
          page,
        };
        if (selectedStatus === STATUS.CLOSED) {
          queryParams.isClosed = true;
        } else if (selectedStatus === STATUS.OPEN) {
          queryParams.isClosed = false;
        }
        if (orderBy) {
          queryParams.sort = `${orderBy},${orderDirection}`;
        }
        http
          .get(resourceUrl, { params: queryParams })
          .then((response) => {
            const result = response.data;
            const items = (
              result.content ||
              result._embedded?.ruleFailureTelemetries ||
              result.ruleFailureTelemetries ||
              result.data ||
              (Array.isArray(result) ? result : [])
            ).map((item) => ({
              ...item,
              closed: item.isClosed ?? item.closed ?? false,
            }));
            const totalCount =
              result.page?.totalElements ??
              result.totalElements ??
              result.total ??
              items.length;
            resolve({
              data: items,
              totalCount,
            });
          })
          .catch((error) => {
            console.error("Failed to fetch rule failures:", error);
            resolve({
              data: [],
              totalCount: 0,
            });
          });
      }),
    [selectedStatus],
  );

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        width: isChatOpen ? "calc(85%)" : "calc(100%)",
        transition: "width 0.3s ease",
      }}
    >
      <Title title="Rule Failures" />
      <Grid
        container
        sx={{ justifyContent: "flex-end", mb: 2, paddingRight: "80px" }}
      >
        <Grid>
          <ButtonGroup color="primary">
            <Button
              variant={
                selectedStatus === STATUS.OPEN ? "contained" : "outlined"
              }
              onClick={() => onSelect(STATUS.OPEN)}
            >
              Open
            </Button>
            <Button
              variant={
                selectedStatus === STATUS.CLOSED ? "contained" : "outlined"
              }
              onClick={() => onSelect(STATUS.CLOSED)}
            >
              Closed
            </Button>
            <Button
              variant={selectedStatus === STATUS.ALL ? "contained" : "outlined"}
              onClick={() => onSelect(STATUS.ALL)}
            >
              All
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <Box
        sx={{
          overflowX: "auto",
          maxWidth: "95%",
          "& .MuiTableContainer-root": {
            maxHeight: "70vh",
            overflowY: "auto",
          },
          "& .MuiTable-root": {
            minWidth: 800,
            tableLayout: "fixed",
          },
          "& .MuiTableCell-root": {
            padding: "8px 12px",
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            fontWeight: 600,
            backgroundColor: "#f5f5f5",
            borderBottom: "2px solid #e0e0e0",
          },
        }}
      >
        <AvniMaterialTable
          title=""
          ref={tableRef}
          columns={columns}
          fetchData={fetchData}
          options={{
            enableRowSelection: true,
            enableSelectAll: true,
            pageSize: 10,
            pageSizeOptions: [10, 20, 50],
            sorting: true,
            debounceInterval: 500,
            search: false,
            rowStyle: ({ original }) => ({
              backgroundColor: (original?.closed ?? false) ? "#f5f5f5" : "#fff",
            }),
            density: "compact",
            columnResizing: true,
            enableColumnResizing: true,
          }}
          renderDetailPanel={({ row }) => (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#f9f9f9",
                borderTop: "1px solid #e0e0e0",
                maxWidth: "100%",
              }}
            >
              <Box
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "200px",
                  overflowY: "auto",
                  backgroundColor: "white",
                  p: 1,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                }}
              >
                {row.original.stacktrace || "No stacktrace available"}
              </Box>
            </Box>
          )}
          onRowClick={(event, row, togglePanel) => togglePanel()}
          components={components}
          route="/appdesigner/ruleFailures"
          onRowSelectionChange={(selectedRowIds) => {
            console.log("Native selection changed:", selectedRowIds);
          }}
        />
      </Box>
    </Box>
  );
};

export default RuleFailureTelemetryList;
