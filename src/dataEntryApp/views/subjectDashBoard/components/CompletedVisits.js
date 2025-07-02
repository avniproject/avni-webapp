import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { Paper, Grid } from "@mui/material";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "../../../../common/components/utils";
import { loadEncounters, loadProgramEncounters } from "../../../reducers/completedVisitsReducer";
import { useTranslation } from "react-i18next";
import FilterResult from "../components/FilterResult";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import CompletedVisitsTable from "dataEntryApp/views/subjectDashBoard/CompletedVisitsTable";
import { voidGeneralEncounter, voidProgramEncounter } from "../../../reducers/subjectDashboardReducer";
import ConfirmDialog from "../../../components/ConfirmDialog";

const useStyle = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(3),
    overflowX: "auto"
  },
  tableContainer: {
    minWidth: 1000,
    padding: "5px"
  },
  completedVsits: {
    fontWeight: "550",
    fontSize: "21px"
  },
  resultFound: {
    fontWeight: "500"
  },
  searchCreateToolbar: {
    display: "flex"
  },
  searchForm: {
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(8),
    display: "flex",
    alignItems: "flex-end",
    flex: 8
  },
  searchFormItem: {
    margin: theme.spacing(1)
  },
  searchBtnShadow: {
    boxShadow: "none"
  },
  searchButtonStyle: {
    color: "white",
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50
  },
  createButtonHolder: {
    flex: 1
  },
  searchBox: {
    padding: "1.5rem",
    margin: "0rem 1rem"
  },
  tableBox: {
    padding: "1.5rem"
  },
  Typography: {
    fontSize: "12px"
  }
}));

const CompleteVisit = ({
  entityUuid,
  isForProgramEncounters,
  encounterTypes,
  load,
  loadProgramEncounters,
  loadEncounters,
  voidGeneralEncounter,
  voidProgramEncounter
}) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const [filterParams, setFilterParams] = React.useState({});

  const filterQueryString = new URLSearchParams(filterParams).toString();

  const apiUrl = isForProgramEncounters ? `/web/programEnrolment/${entityUuid}/completed` : `/web/subject/${entityUuid}/completed`;
  const viewEncounterUrl = (action = "") =>
    isForProgramEncounters ? `/app/subject/view${action}ProgramEncounter` : `/app/subject/view${action}Encounter`;
  const editEncounterUrl = (action = "") =>
    isForProgramEncounters ? `/app/subject/edit${action}ProgramEncounter` : `/app/subject/edit${action}Encounter`;

  useEffect(() => {
    isForProgramEncounters ? loadProgramEncounters(entityUuid, filterQueryString) : loadEncounters(entityUuid, filterQueryString);
  }, [entityUuid]);

  const [encounterUUID, setEncounterUUID] = React.useState();
  const voidEncounter = isForProgramEncounters ? voidProgramEncounter : voidGeneralEncounter;

  return encounterTypes && load ? (
    <div>
      <Fragment>
        <Paper className={classes.searchBox}>
          <Grid
            container
            sx={{
              justifyContent: "flex-end"
            }}
          >
            <FilterResult encounterTypes={encounterTypes} setFilterParams={setFilterParams} />
          </Grid>
          <Paper className={classes.tableBox}>
            <CompletedVisitsTable
              apiUrl={apiUrl}
              viewEncounterUrl={viewEncounterUrl}
              filterParams={filterParams}
              editEncounterUrl={editEncounterUrl}
              isForProgramEncounters={isForProgramEncounters}
              onDelete={encounter => setEncounterUUID(encounter.uuid)}
            />
            <ConfirmDialog
              title={isForProgramEncounters ? t("ProgramEncounterVoidAlertTitle") : t("GeneralEncounterVoidAlertTitle")}
              open={encounterUUID !== undefined}
              setOpen={() => setEncounterUUID()}
              message={isForProgramEncounters ? t("ProgramEncounterVoidAlertMessage") : t("GeneralEncounterVoidAlertMessage")}
              onConfirm={() => voidEncounter(encounterUUID)}
            />
          </Paper>
        </Paper>
      </Fragment>
    </div>
  ) : (
    <CustomizedBackdrop load={load} />
  );
};
const mapStateToProps = state => {
  return {
    encounterTypes: state.dataEntry.completedVisitsReducer.encounterTypes,
    load: state.dataEntry.loadReducer.load
  };
};
const mapDispatchToProps = {
  loadEncounters,
  loadProgramEncounters,
  voidGeneralEncounter,
  voidProgramEncounter
};
export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CompleteVisit)
  )
);
