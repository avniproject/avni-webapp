import { useImperativeHandle, useEffect, useReducer, useState, useRef, useCallback, useMemo } from "react";
import { styled } from "@mui/material/styles";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { MaterialReactTable } from "material-react-table";
import api from "../api";
import {
  getAssignmentValue,
  getFilterPayload,
  getMetadataOptions,
  initialState,
  SubjectAssignmentReducer
} from "../reducers/SubjectAssignmentReducer";
import { getColumns } from "./SubjectAssignmentColumns";
import { fetchSubjectData } from "./SubjectAssignmentData";
import { Grid, FormControlLabel, Radio } from "@mui/material";
import SubjectAssignmentFilter from "./SubjectAssignmentFilter";
import { refreshTable } from "../util/util";
import { AssignmentToolBar } from "../components/AssignmentToolBar";
import { includes, map, mapValues } from "lodash";
import { SubjectAssignmentAction } from "../components/SubjectAssignmentAction";

const StyledRootDiv = styled("div")({
  height: "85vh",
  backgroundColor: "#FFF",
  overflow: "visible"
});

const StyledTableContainer = styled("div")({
  overflowX: "auto",
  overflowY: "hidden"
});

const StyledMaterialReactTable = styled(MaterialReactTable)(({ theme }) => ({
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
}));

const SubjectAssignment = () => {
  const [state, updateState] = useReducer(SubjectAssignmentReducer, initialState);
  const dispatch = (type, payload) => updateState({ type, payload });
  const {
    subjectOptions,
    programOptions,
    userOptions,
    userGroupOptions,
    syncAttribute1,
    syncAttribute2,
    userOptionsWithIds
  } = getMetadataOptions(state.metadata, state.filterCriteria);
  const tableRef = useRef(null);
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    api.getSubjectAssignmentMetadata().then(metadata => {
      console.log("Metadata fetched:", metadata);
      dispatch("setMetadata", metadata);
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!state.loaded) {
      console.log("loadData skipped: state.loaded is false");
      return;
    }
    console.log("loadData called with filterCriteria:", state.filterCriteria, "pagination:", pagination);
    setIsLoading(true);
    try {
      const query = {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        orderBy: sorting[0]?.id,
        order: sorting[0]?.desc ? "desc" : "asc"
      };
      const response = await fetchSubjectData(query, state.filterCriteria);
      const normalizedData = Array.isArray(response)
        ? { data: response, rowCount: response.length }
        : response || { data: [], rowCount: 0 };
      console.log("loadData response:", normalizedData);
      setData(normalizedData.data || []);
      setRowCount(normalizedData.rowCount || normalizedData.totalCount || 0);
    } catch (error) {
      console.error("loadData error:", error);
      setData([]);
      setRowCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, state.filterCriteria, state.loaded]);

  useEffect(() => {
    console.log("loadData effect triggered, state.loaded:", state.loaded);
    loadData();
  }, [loadData]);

  const columns = useMemo(() => {
    console.log("columns useMemo called, state.loaded:", state.loaded);
    console.log("state.metadata:", state.metadata);
    console.log("state.filterCriteria:", state.filterCriteria);
    if (!state.loaded) {
      console.log("Returning empty columns array due to state.loaded false");
      return [];
    }
    try {
      const cols = getColumns(state.metadata, state.filterCriteria);
      console.log("getColumns returned:", cols);
      return cols || [];
    } catch (error) {
      console.error("getColumns error:", error, error.stack);
      return [];
    }
  }, [state.loaded, state.metadata, state.filterCriteria]);

  const onFilterApply = () => {
    console.log("onFilterApply called");
    refreshTable(tableRef);
  };

  const applicableActionsOptions = map(state.applicableActions, ({ name, actionId }) => (
    <FormControlLabel value={actionId} control={<Radio />} label={name} key={actionId} />
  ));

  const onActionDone = async () => {
    console.log("onActionDone called, filterCriteria:", state.filterCriteria, "assignmentCriteria:", state.assignmentCriteria);
    updateState({ type: "onSave", payload: { saveStart: true } });
    updateState({ type: "hideAction" });
    const assignmentCriteriaValues = mapValues(state.assignmentCriteria, (v, k) =>
      includes(["userId", "actionId"], k) ? getAssignmentValue(k, state.assignmentCriteria) : v
    );
    const [error] = await api.postUpdateUserAssignmentToSubject({
      ...assignmentCriteriaValues,
      taskFilterCriteria: getFilterPayload(state.filterCriteria)
    });
    if (error) {
      console.error("onActionDone error:", error);
      alert(error);
    }
    refreshTable(tableRef);
    updateState({ type: "onSave", payload: { saveStart: false } });
  };

  useImperativeHandle(tableRef, () => ({
    refresh: loadData
  }));

  const renderData = () => {
    console.log("renderData called, state.loaded:", state.loaded);
    if (!state.loaded) {
      console.log("renderData returning null due to state.loaded false");
      return null;
    }
    console.log("renderData columns:", columns);
    return (
      <StyledRootDiv>
        <Grid container>
          <Grid size={8}>
            <StyledTableContainer>
              <StyledMaterialReactTable
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
                    dispatch={updateState}
                    assignmentCriteria={state.assignmentCriteria}
                    showSelect1000={false}
                    data={data}
                    selectedRows={table.getSelectedRowModel().rows.map(row => ({
                      id: row.original.id,
                      type: row.original.type
                    }))}
                  />
                )}
              />
            </StyledTableContainer>
          </Grid>
          <Grid size={1} />
          <Grid size={3}>
            <SubjectAssignmentFilter
              subjectOptions={subjectOptions}
              programOptions={programOptions}
              userOptions={userOptions}
              userGroupOptions={userGroupOptions}
              syncAttribute1={syncAttribute1}
              syncAttribute2={syncAttribute2}
              dispatch={dispatch}
              onFilterApply={onFilterApply}
              filterCriteria={state.filterCriteria}
            />
          </Grid>
          <SubjectAssignmentAction
            openAction={state.displayAction}
            dispatch={updateState}
            onDone={onActionDone}
            actionOptions={applicableActionsOptions}
            userOptions={userOptionsWithIds}
            assignmentCriteria={state.assignmentCriteria}
            isAssignMultiUsers={false}
            userAssignmentKeyName="userId"
            actionAssignmentKeyName="actionId"
          />
        </Grid>
      </StyledRootDiv>
    );
  };

  return <ScreenWithAppBar appbarTitle="Subject Assignment">{renderData()}</ScreenWithAppBar>;
};

export default SubjectAssignment;
