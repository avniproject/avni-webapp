import React, { useEffect, useReducer } from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import MaterialTable from "material-table";
import api from "../api";
import {
  getMetadataOptions,
  initialState,
  SubjectAssignmentReducer
} from "../reducers/SubjectAssignmentReducer";
import { columns } from "./SubjectAssignmentColumns";
import { fetchSubjectData } from "./SubjectAssignmentData";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core";
import SubjectAssignmentFilter from "./SubjectAssignmentFilter";

const useStyles = makeStyles(theme => ({
  root: {
    height: "85vh",
    backgroundColor: "#FFF"
  }
}));
const SubjectAssignment = () => {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [state, updateState] = useReducer(SubjectAssignmentReducer, initialState);
  const dispatch = (type, payload) => updateState({ type, payload });
  const { subjectOptions, programOptions, userOptions, userGroupOptions } = getMetadataOptions(
    state.metadata
  );

  useEffect(() => {
    api.getSubjectAssignmentMetadata().then(metadata => {
      dispatch("setMetadata", metadata);
    });
  }, []);

  console.log("state =>>", state);
  const renderData = () => {
    return (
      <div className={classes.root}>
        <Grid container>
          <Grid item xs={8}>
            <MaterialTable
              title="Subjects"
              tableRef={tableRef}
              columns={columns}
              data={fetchSubjectData}
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
          </Grid>
          <Grid xs={1} />
          <Grid item xs={3}>
            <SubjectAssignmentFilter
              subjectOptions={subjectOptions}
              programOptions={programOptions}
              userOptions={userOptions}
              userGroupOptions={userGroupOptions}
              dispatch={dispatch}
              onFilterApply={() => {}}
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
