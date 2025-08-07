import { useCallback, useState, useEffect } from "react";
import { MaterialReactTable } from "material-react-table";
import { MRTPagination } from "../../adminApp/Util/MRTPagination.tsx";
import { useMRTPagination } from "../../common/hooks/useMRTPagination";
import { LinearProgress, Snackbar, Box, Button } from "@mui/material";
import AddEditContactGroup from "./AddEditContactGroup";
import ContactService from "../api/ContactService";
import ErrorMessage from "../../common/components/ErrorMessage";

const GroupsTab = ({ groups, columns }) => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");
  const [addingContactGroup, setAddingContactGroup] = useState(false);
  const [savedContactGroup, setSavedContactGroup] = useState(false);
  const [displayProgress, setShowProgressBar] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search: globalFilter || ""
      };
      const result = await groups(query);
      setData(result.data || []);
      setTotalRecords(result.totalCount || 0);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(error);
      setData([]);
      setTotalRecords(0);
      setIsLoading(false);
    }
  }, [pagination, globalFilter, groups]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const paginationProps = useMRTPagination({
    pagination,
    setPagination,
    totalRecords,
    isLoading
  });

  const onContactSaved = useCallback(() => {
    setAddingContactGroup(false);
    setSavedContactGroup(true);
    loadData();
  }, [loadData]);

  const onDelete = useCallback(
    selectedRows => {
      setShowProgressBar(true);
      ContactService.deleteContactGroup(selectedRows.map(row => row.id))
        .then(() => {
          setError(null);
          loadData();
        })
        .catch(error => setError(error))
        .finally(() => setShowProgressBar(false));
    },
    [loadData]
  );

  return (
    <Box className="container">
      {addingContactGroup && (
        <AddEditContactGroup
          onClose={() => setAddingContactGroup(false)}
          onSave={onContactSaved}
        />
      )}
      {error && <ErrorMessage error={error} />}
      {displayProgress && <LinearProgress style={{ marginBottom: 30 }} />}
      <MaterialReactTable
        columns={columns}
        data={data}
        manualPagination
        onPaginationChange={setPagination}
        rowCount={totalRecords}
        state={{ pagination, isLoading, globalFilter }}
        enableGlobalFilter
        onGlobalFilterChange={setGlobalFilter}
        enableSorting={false}
        enableColumnFilters={false}
        enableRowSelection
        initialState={{ pagination: { pageSize: 10 } }}
        muiTableProps={{
          sx: {
            "& .MuiTableRow-root": {
              backgroundColor: "#fff"
            },
            "& .MuiTableCell-root": {
              backgroundColor: "#fff"
            }
          }
        }}
        muiTablePaperProps={{
          sx: {
            backgroundColor: "#fff",
            boxShadow: "none",
            border: "1px solid #e0e0e0"
          }
        }}
        muiTopToolbarProps={{
          sx: {
            backgroundColor: "#fff"
          }
        }}
        renderTopToolbarCustomActions={({ table }) => (
          <Box sx={{ display: "flex", gap: "8px" }}>
            <Button
              onClick={() => {
                const selectedRows = table
                  .getSelectedRowModel()
                  .rows.map(row => row.original);
                onDelete(selectedRows);
              }}
              disabled={table.getSelectedRowModel().rows.length === 0}
            >
              Delete
            </Button>
            <Button onClick={() => setAddingContactGroup(true)}>
              Add Contact Group
            </Button>
          </Box>
        )}
        renderBottomToolbar={() => <MRTPagination {...paginationProps} />}
      />
      <Snackbar
        open={savedContactGroup}
        autoHideDuration={3000}
        onClose={() => setSavedContactGroup(false)}
        message="Created new contact group"
      />
    </Box>
  );
};

export default GroupsTab;
