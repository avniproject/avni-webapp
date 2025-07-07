import { useState, useRef, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { httpClient as http } from "common/utils/httpClient";
import moment from "moment";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { Close, MenuOpen } from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";

const STATUS = {
  OPEN: 1,
  CLOSED: 2,
  ALL: 3
};

const RuleFailureTelemetryList = ({ userInfo }) => {
  const [selectedStatus, setSelectedStatus] = useState(STATUS.OPEN);
  const [selectedRows, setSelectedRows] = useState([]); // Fallback for custom selection
  const tableRef = useRef(null);

  const onSelect = useCallback(status => {
    setSelectedStatus(status);
    setSelectedRows([]); // Clear selection on filter change
    if (tableRef.current) {
      tableRef.current.refresh({ page: 0 });
    }
  }, []);

  const toggleRowSelection = useCallback(row => {
    setSelectedRows(prev => {
      const id = row.original?.id || row.id;
      const newSelection = prev.some(r => (r.original?.id || r.id) === id)
        ? prev.filter(r => (r.original?.id || r.id) !== id)
        : [...prev, row];
      console.log("Toggle selection:", newSelection, "Row:", row);
      return newSelection;
    });
  }, []);

  const columns = useMemo(
    () => [
      // Custom checkbox column as fallback
      {
        accessorKey: "select",
        header: "",
        enableSorting: false,
        Cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.some(r => (r.original?.id || r.id) === (row.original?.id || row.id))}
            onChange={() => toggleRowSelection(row)}
          />
        )
      },
      {
        accessorKey: "errorMessage",
        header: "Message",
        enableSorting: true,
        Cell: ({ row }) => row.original.errorMessage || "-"
      },
      {
        accessorKey: "closed",
        header: "Status",
        enableSorting: true,
        Cell: ({ row }) => (row.original.closed ? "Closed" : "Open")
      },
      {
        accessorKey: "errorDateTime",
        header: "Error Date",
        enableSorting: true,
        Cell: ({ row }) => moment(row.original.errorDateTime).format("YYYY-MM-DD HH:mm")
      },
      {
        accessorKey: "closedDateTime",
        header: "Closed Date",
        enableSorting: true,
        Cell: ({ row }) => (row.original.closedDateTime ? moment(row.original.closedDateTime).format("YYYY-MM-DD HH:mm") : "-")
      },
      {
        accessorKey: "individualUuid",
        header: "Individual UUID",
        enableSorting: true,
        Cell: ({ row }) => row.original.individualUuid || "-"
      },
      {
        accessorKey: "ruleUuid",
        header: "Rule UUID",
        enableSorting: true,
        Cell: ({ row }) => row.original.ruleUuid || "-"
      },
      {
        accessorKey: "sourceId",
        header: "Source",
        enableSorting: true,
        Cell: ({ row }) => (
          <>
            <span>{row.original.sourceId || ""}</span>
            <b>{row.original.sourceType ? ` (${row.original.sourceType})` : ""}</b>
          </>
        )
      },
      {
        accessorKey: "entityId",
        header: "Entity",
        enableSorting: true,
        Cell: ({ row }) => (
          <>
            <span>{row.original.entityId || ""}</span>
            <b>{row.original.entityType ? ` (${row.original.entityType})` : ""}</b>
          </>
        )
      },
      {
        accessorKey: "appType",
        header: "App",
        enableSorting: true,
        Cell: ({ row }) => row.original.appType || "-"
      }
    ],
    [selectedRows, toggleRowSelection]
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection }) =>
      new Promise(resolve => {
        const resourceUrl = "/web/ruleFailureTelemetry";
        const queryParams = {
          size: pageSize,
          page
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
          .then(response => {
            const result = response.data;
            const items = (
              result.content ||
              result._embedded?.ruleFailureTelemetries ||
              result.ruleFailureTelemetries ||
              result.data ||
              (Array.isArray(result) ? result : [])
            ).map(item => ({
              ...item,
              closed: item.isClosed ?? item.closed ?? false
            }));
            const totalCount = result.page?.totalElements ?? result.totalElements ?? result.total ?? items.length;
            resolve({
              data: items,
              totalCount
            });
          })
          .catch(error => {
            console.error("Failed to fetch rule failures:", error);
            resolve({
              data: [],
              totalCount: 0
            });
          });
      }),
    [selectedStatus]
  );

  const actions = useMemo(
    () =>
      UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditRuleFailure)
        ? [
            {
              icon: Close,
              tooltip: "Close Selected Errors",
              isFreeAction: true,
              disabled: selectedStatus === STATUS.CLOSED,
              onClick: (event, table) => {
                const nativeSelected = table?.getSelectedRowModel()?.rows;
                const selected = nativeSelected?.length > 0 ? nativeSelected : selectedRows;
                console.log(
                  "Close action - Native selected:",
                  nativeSelected,
                  "Custom selected:",
                  selectedRows,
                  "Final selected:",
                  selected,
                  "Table:",
                  table
                );
                if (!Array.isArray(selected) || selected.length === 0) {
                  alert("Please select at least one error to close.");
                  return;
                }
                const request = {
                  params: {
                    ids: selected.map(row => row.original?.id || row.id).join(","),
                    isClosed: true
                  }
                };
                http
                  .put("/web/ruleFailureTelemetry", null, request)
                  .then(() => {
                    if (tableRef.current) {
                      tableRef.current.refresh();
                      setSelectedRows([]); // Clear custom selection
                    }
                  })
                  .catch(error => {
                    console.error("Failed to close selected errors:", error);
                    alert("Failed to close selected errors. Please try again.");
                  });
              }
            },
            {
              icon: MenuOpen,
              tooltip: "Reopen Selected Errors",
              isFreeAction: true,
              disabled: selectedStatus === STATUS.OPEN,
              onClick: (event, table) => {
                const nativeSelected = table?.getSelectedRowModel()?.rows;
                const selected = nativeSelected?.length > 0 ? nativeSelected : selectedRows;
                console.log(
                  "Reopen action - Native selected:",
                  nativeSelected,
                  "Custom selected:",
                  selectedRows,
                  "Final selected:",
                  selected,
                  "Table:",
                  table
                );
                if (!Array.isArray(selected) || selected.length === 0) {
                  alert("Please select at least one error to reopen.");
                  return;
                }
                const request = {
                  params: {
                    ids: selected.map(row => row.original?.id || row.id).join(","),
                    isClosed: false
                  }
                };
                http
                  .put("/web/ruleFailureTelemetry", null, request)
                  .then(() => {
                    if (tableRef.current) {
                      tableRef.current.refresh();
                      setSelectedRows([]); // Clear custom selection
                    }
                  })
                  .catch(error => {
                    console.error("Failed to reopen selected errors:", error);
                    alert("Failed to reopen selected errors. Please try again.");
                  });
              }
            }
          ]
        : [],
    [selectedStatus, userInfo, selectedRows]
  );

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title="Rule Failures" />
      <div className="container">
        <Box
          sx={{
            mb: 2
          }}
        >
          <ButtonGroup color="primary">
            <Button variant={selectedStatus === STATUS.OPEN ? "contained" : "outlined"} onClick={() => onSelect(STATUS.OPEN)}>
              Open
            </Button>
            <Button variant={selectedStatus === STATUS.CLOSED ? "contained" : "outlined"} onClick={() => onSelect(STATUS.CLOSED)}>
              Closed
            </Button>
            <Button variant={selectedStatus === STATUS.ALL ? "contained" : "outlined"} onClick={() => onSelect(STATUS.ALL)}>
              All
            </Button>
          </ButtonGroup>
        </Box>
        <AvniMaterialTable
          title=""
          ref={tableRef}
          columns={columns}
          fetchData={fetchData}
          options={{
            enableRowSelection: true, // Enable native checkboxes
            enableSelectAll: true, // Allow select all
            pageSize: 10,
            pageSizeOptions: [10, 20, 50],
            sorting: true,
            debounceInterval: 500,
            search: false,
            rowStyle: ({ original }) => ({
              backgroundColor: original?.closed ?? false ? "#DBDBDB" : "#fff"
            })
          }}
          renderDetailPanel={({ row }) => (
            <Box
              sx={{
                p: 2
              }}
            >
              <div>{row.original.stacktrace || "-"}</div>
            </Box>
          )}
          onRowClick={(event, row, togglePanel) => togglePanel()}
          actions={actions}
          route="/appdesigner/ruleFailures"
          onRowSelectionChange={selectedRowIds => {
            console.log("Native selection changed:", selectedRowIds);
          }}
        />
      </div>
    </Box>
  );
};
const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});
export default connect(mapStateToProps)(RuleFailureTelemetryList);
