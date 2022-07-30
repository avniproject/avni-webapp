import React, { useEffect } from "react";
import api from "../api";
import {
  getAllSearchFields,
  getAssignmentValue,
  getMetadataOptions,
  initialState,
  TaskAssignmentReducer
} from "../reducers";
import MaterialTable from "material-table";
import { getTableColumns } from "./TableColumns";
import { fetchTasks } from "./FetchTasks";
import { get, includes, isEmpty, mapValues } from "lodash";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { Grid } from "@material-ui/core";
import { Filter } from "../components/Filter";
import { AssignmentAction } from "../components/AssignmentAction";
import { AssignmentToolBar } from "../components/AssignmentToolBar";
import CustomizedBackdrop from "../../dataEntryApp/components/CustomizedBackdrop";

const refreshTable = ref => ref.current && ref.current.onQueryChange();
const tableRef = React.createRef();

const TaskAssignment = ({ history, ...props }) => {
  const [state, dispatch] = React.useReducer(TaskAssignmentReducer, initialState);
  const { filterCriteria, taskMetadata, displayAction, assignmentCriteria } = state;
  const { taskTypeOptions, taskStatusOptions, userOptions } = getMetadataOptions(
    taskMetadata,
    filterCriteria
  );

  useEffect(() => {
    api.getTaskMetadata().then(response => dispatch({ type: "setData", payload: response }));
  }, []);

  const onFilterApply = () => {
    refreshTable(tableRef);
  };

  const onActionDone = async () => {
    dispatch({ type: "onSave", payload: { saveStart: true } });
    dispatch({ type: "hideAction" });
    const taskFilterCriteria = mapValues(filterCriteria, value => get(value, "value", null));
    const assignmentCriteriaValues = mapValues(assignmentCriteria, (v, k) =>
      includes(["assignToUserIds", "statusId", "assignToUserId"], k)
        ? getAssignmentValue(k, assignmentCriteria)
        : v
    );
    const [error] = await api.assignTask({ ...assignmentCriteriaValues, taskFilterCriteria });
    if (error) {
      alert(error);
    }
    refreshTable(tableRef);
    dispatch({ type: "onSave", payload: { saveStart: false } });
  };

  const renderContent = () => (
    <Grid container>
      <Grid item xs={8}>
        <MaterialTable
          title="All Tasks"
          tableRef={tableRef}
          columns={getTableColumns(taskMetadata)}
          data={query => fetchTasks(query, filterCriteria)}
          options={{
            pageSize: 10,
            pageSizeOptions: [10, 15, 20],
            addRowPosition: "first",
            sorting: true,
            debounceInterval: 500,
            search: false,
            selection: true
          }}
          components={{
            Toolbar: props => (
              <AssignmentToolBar
                dispatch={dispatch}
                assignmentCriteria={assignmentCriteria}
                {...props}
              />
            )
          }}
        />
      </Grid>
      <Grid xs={1} />
      <Grid item xs={3}>
        <Filter
          dispatch={dispatch}
          filterCriteria={filterCriteria}
          onFilterApply={onFilterApply}
          taskStatusOptions={taskStatusOptions}
          taskTypeOptions={taskTypeOptions}
          userOptions={userOptions}
          searchFields={getAllSearchFields(taskMetadata)}
        />
      </Grid>
      <AssignmentAction
        openAction={displayAction}
        dispatch={dispatch}
        onDone={onActionDone}
        taskStatusOptions={taskStatusOptions}
        userOptions={userOptions}
        assignmentCriteria={assignmentCriteria}
      />
    </Grid>
  );

  return (
    <ScreenWithAppBar appbarTitle={"Task Assignment"}>
      {isEmpty(taskMetadata) ? null : renderContent()}
      <CustomizedBackdrop load={!state.saving} />
    </ScreenWithAppBar>
  );
};

export default TaskAssignment;
