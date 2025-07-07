import { useImperativeHandle, useEffect, useReducer, useState, useCallback, useMemo, useRef } from "react";
import { styled } from "@mui/material/styles";
import api from "../api";
import {
  getAssignmentValue,
  getFilterPayload,
  getMetadataOptions,
  initialState,
  TaskAssignmentReducer,
  TaskMetadata
} from "../reducers/TaskAssignmentReducer";
import { MaterialReactTable } from "material-react-table";
import { fetchTasks } from "./FetchTasks";
import { includes, isEmpty, map, mapValues } from "lodash";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { Grid } from "@mui/material";
import { TaskAssignmentFilter } from "../components/TaskAssignmentFilter";
import { TaskAssignmentAction } from "../components/TaskAssignmentAction";
import { AssignmentToolBar } from "../components/AssignmentToolBar";
import CustomizedBackdrop from "../../dataEntryApp/components/CustomizedBackdrop";
import { labelValue, refreshTable } from "../util/util";

const StyledContainer = styled("div")({
  height: "85vh",
  backgroundColor: "#FFF"
});

const StyledTable = styled(MaterialReactTable)({
  "& .MuiTableHeadCell-root": {
    zIndex: 2
  },
  "& .MuiTableContainer-root": {
    maxHeight: "75vh",
    minHeight: "75vh",
    overflowY: "auto",
    position: "relative"
  },
  "& .MuiPaper-root": {
    elevation: 0
  }
});

const TaskAssignment = ({ history, ...props }) => {
  const [state, dispatch] = useReducer(TaskAssignmentReducer, initialState);
  const { filterCriteria, taskMetadata, displayAction, assignmentCriteria, applyableTaskStatuses } = state;
  const { taskTypeOptions, taskStatusOptions, userOptions } = getMetadataOptions(taskMetadata, filterCriteria);
  const applyableTaskStatusesOptions = map(applyableTaskStatuses, ({ name, id }) => labelValue(name, id));

  useEffect(() => {
    api.getTaskMetadata().then(response => dispatch({ type: "setData", payload: response }));
  }, []);

  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);

  const tableRef = useRef(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize
      };
      if (sorting.length > 0 && sorting[0].id) {
        query.orderBy = sorting[0].id;
        query.order = sorting[0].desc ? "desc" : "asc";
      }
      const response = await fetchTasks(query, filterCriteria);
      setData(response.data);
      setRowCount(response.totalCount);
    } catch (error) {
      console.error("loadData error:", error);
      setData([]);
      setRowCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, filterCriteria]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = useMemo(() => {
    if (!taskMetadata) return [];
    return [
      {
        header: "Name",
        accessorKey: "name"
      },
      {
        header: "Assigned To",
        accessorKey: "assignedTo"
      },
      {
        header: "Status",
        accessorKey: "taskStatus"
      },
      {
        header: "Created",
        accessorKey: "createdDateTime"
      },
      {
        header: "Scheduled",
        accessorKey: "scheduledOn"
      },
      {
        header: "Completed",
        accessorKey: "completedOn"
      },
      ...TaskMetadata.getAllSearchFields(taskMetadata).map(([name]) => ({
        header: name,
        accessorFn: row => row.metadata?.[name]
      }))
    ];
  }, [taskMetadata]);

  useImperativeHandle(tableRef, () => ({
    refresh: loadData
  }));

  const onFilterApply = () => {
    refreshTable(tableRef);
  };

  const onActionDone = async () => {
    dispatch({ type: "onSave", payload: { saveStart: true } });
    dispatch({ type: "hideAction" });
    const assignmentCriteriaValues = mapValues(assignmentCriteria, (v, k) =>
      includes(["assignToUserIds", "statusId"], k) ? getAssignmentValue(k, assignmentCriteria) : v
    );
    const [error] = await api.assignTask({
      ...assignmentCriteriaValues,
      taskFilterCriteria: getFilterPayload(filterCriteria)
    });
    if (error) {
      alert(error);
    }
    refreshTable(tableRef);
    dispatch({ type: "onSave", payload: { saveStart: false } });
  };

  const renderContent = () => (
    <StyledContainer>
      <Grid container>
        <Grid size={8}>
          <StyledTable
            columns={columns}
            data={data}
            manualPagination
            manualSorting
            enableRowSelection
            enableGlobalFilter={false}
            enableColumnFilters={false}
            enableSorting
            rowCount={rowCount}
            state={{ pagination, sorting, isLoading }}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            initialState={{
              pagination: { pageSize: 10 }
            }}
            muiTablePaginationProps={{
              rowsPerPageOptions: [10, 15, 25]
            }}
            renderTopToolbar={({ table }) => (
              <AssignmentToolBar
                dispatch={dispatch}
                assignmentCriteria={assignmentCriteria}
                showSelect1000={false}
                data={data}
                selectedRows={table.getSelectedRowModel().rows.map(row => ({
                  id: row.original.id
                }))}
              />
            )}
          />
        </Grid>
        <Grid size={1} />
        <Grid size={3}>
          <TaskAssignmentFilter
            dispatch={dispatch}
            filterCriteria={filterCriteria}
            onFilterApply={onFilterApply}
            taskStatusOptions={taskStatusOptions}
            taskTypeOptions={taskTypeOptions}
            userOptions={userOptions}
            conceptNameAnswerPairs={TaskMetadata.getAllSearchFields(taskMetadata)}
          />
        </Grid>
        <TaskAssignmentAction
          openAction={displayAction}
          dispatch={dispatch}
          onDone={onActionDone}
          taskStatusOptions={applyableTaskStatusesOptions}
          userOptions={userOptions}
          assignmentCriteria={assignmentCriteria}
        />
      </Grid>
    </StyledContainer>
  );

  return (
    <ScreenWithAppBar appbarTitle={"Task Assignment"}>
      {isEmpty(taskMetadata) ? null : renderContent()}
      <CustomizedBackdrop load={!state.saving} />
    </ScreenWithAppBar>
  );
};

export default TaskAssignment;
