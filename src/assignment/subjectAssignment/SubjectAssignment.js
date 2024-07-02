import React, { useEffect, useReducer } from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import MaterialTable from "material-table";
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
import Grid from "@material-ui/core/Grid";
import { FormControlLabel, makeStyles, Radio } from "@material-ui/core";
import SubjectAssignmentFilter from "./SubjectAssignmentFilter";
import { refreshTable } from "../util/util";
import { AssignmentToolBar } from "../components/AssignmentToolBar";
import Paper from "@material-ui/core/Paper";
import { includes, map, mapValues } from "lodash";
import { SubjectAssignmentAction } from "../components/SubjectAssignmentAction";
import materialTableIcons from "../../common/material-table/MaterialTableIcons";

const useStyles = makeStyles(theme => ({
  root: {
    height: "85vh",
    backgroundColor: "#FFF"
  }
}));

const tableRef = React.createRef();

const SubjectAssignment = () => {
  const classes = useStyles();
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

  useEffect(() => {
    api.getSubjectAssignmentMetadata().then(metadata => {
      dispatch("setMetadata", metadata);
    });
  }, []);

  const onFilterApply = () => {
    refreshTable(tableRef);
  };

  const applicableActionsOptions = map(state.applicableActions, ({ name, actionId }) => (
    <FormControlLabel value={actionId} control={<Radio />} label={name} key={actionId} />
  ));

  const onActionDone = async () => {
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
      alert(error);
    }
    refreshTable(tableRef);
    updateState({ type: "onSave", payload: { saveStart: false } });
  };

  const renderData = () => {
    return (
      <div className={classes.root}>
        <Grid container>
          <Grid item xs={8}>
            <div style={{ maxWidth: "100%" }}>
              <MaterialTable
                icons={materialTableIcons}
                title="Subjects"
                tableRef={tableRef}
                columns={getColumns(state.metadata, state.filterCriteria)}
                data={query => fetchSubjectData(query, state.filterCriteria)}
                options={{
                  pageSize: 10,
                  pageSizeOptions: [10, 15, 25],
                  addRowPosition: "first",
                  sorting: true,
                  headerStyle: {
                    zIndex: 1
                  },
                  debounceInterval: 500,
                  search: false,
                  maxBodyHeight: "75vh",
                  minBodyHeight: "75vh",
                  selection: true
                }}
                components={{
                  Toolbar: props => (
                    <AssignmentToolBar
                      dispatch={updateState}
                      assignmentCriteria={state.assignmentCriteria}
                      showSelect1000={false}
                      {...props}
                    />
                  ),
                  Container: props => <Paper {...props} elevation={0} />
                }}
              />
            </div>
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={3}>
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
      </div>
    );
  };

  return <ScreenWithAppBar appbarTitle={"Subject Assignment"}>{state.loaded && renderData()}</ScreenWithAppBar>;
};

export default SubjectAssignment;
