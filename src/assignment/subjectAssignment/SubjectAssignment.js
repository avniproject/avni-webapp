import React, { useEffect, useReducer } from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import MaterialTable from "material-table";
import api from "../api";
import {
  getMetadataOptions,
  initialState,
  SubjectAssignmentReducer
} from "../reducers/SubjectAssignmentReducer";
import { getColumns } from "./SubjectAssignmentColumns";
import { fetchSubjectData } from "./SubjectAssignmentData";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core";
import SubjectAssignmentFilter from "./SubjectAssignmentFilter";
import { refreshTable } from "../util/util";

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
    syncAttribute2
  } = getMetadataOptions(state.metadata, state.filterCriteria);

  useEffect(() => {
    api.getSubjectAssignmentMetadata().then(metadata => {
      dispatch("setMetadata", metadata);
    });
  }, []);

  const onFilterApply = () => {
    refreshTable(tableRef);
  };

  const renderData = () => {
    return (
      <div className={classes.root}>
        <Grid container>
          <Grid item xs={8}>
            <div style={{ maxWidth: "100%" }}>
              <MaterialTable
                title="Subjects"
                tableRef={tableRef}
                columns={getColumns(state.metadata, state.filterCriteria)}
                data={query => fetchSubjectData(query, state.filterCriteria)}
                options={{
                  pageSize: 10,
                  pageSizeOptions: [10, 15, 25],
                  addRowPosition: "first",
                  sorting: true,
                  debounceInterval: 500,
                  search: false,
                  maxBodyHeight: "75vh",
                  minBodyHeight: "75vh"
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
        </Grid>
      </div>
    );
  };

  return (
    <ScreenWithAppBar appbarTitle={"Subject Assignment"}>
      {state.loaded && renderData()}
    </ScreenWithAppBar>
  );
};

export default SubjectAssignment;
