import React, { Fragment, useEffect } from "react";
import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { withParams } from "../../../../common/components/utils";
import { loadEncounters, loadProgramEncounters } from "../../../reducers/completedVisitsReducer";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import FilterResult from "../components/FilterResult";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import CompletedVisitsTable from "dataEntryApp/views/subjectDashBoard/CompletedVisitsTable";

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
  match,
  getCompletedVisit,
  getEnrolments,
  completedVisits,
  encounterTypes,
  load,
  loadProgramEncounters,
  loadEncounters
}) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const [filterParams, setFilterParams] = React.useState({});

  const filterQueryString = new URLSearchParams(filterParams).toString();
  const isForProgramEncounters = match.path === "/app/subject/completedProgramEncounters";
  const entityUuid = match.queryParams.uuid;
  const apiUrl = isForProgramEncounters
    ? `/web/programEnrolment/${entityUuid}/completed`
    : `/web/subject/${entityUuid}/completed`;
  const viewEncounterUrl = (action = "") =>
    isForProgramEncounters
      ? `/app/subject/view${action}ProgramEncounter`
      : `/app/subject/view${action}Encounter`;
  const editEncounterUrl = (action = "") =>
    isForProgramEncounters
      ? `/app/subject/edit${action}ProgramEncounter`
      : `/app/subject/edit${action}Encounter`;

  useEffect(() => {
    isForProgramEncounters
      ? loadProgramEncounters(match.queryParams.uuid, filterQueryString)
      : loadEncounters(match.queryParams.uuid, filterQueryString);
  }, []);

  return encounterTypes && load ? (
    <div>
      <Fragment>
        <Breadcrumbs path={match.path} />
        <Paper className={classes.searchBox}>
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom className={classes.completedVsits}>
                {t("completedVisits")}
              </Typography>
            </Grid>
            <Grid item xs={6} container direction="row" justify="flex-end" alignItems="flex-start">
              <FilterResult encounterTypes={encounterTypes} setFilterParams={setFilterParams} />
            </Grid>
          </Grid>
          <Paper className={classes.tableBox}>
            <CompletedVisitsTable
              apiUrl={apiUrl}
              viewEncounterUrl={viewEncounterUrl}
              filterParams={filterParams}
              entityUuid={match.queryParams.uuid}
              editEncounterUrl={editEncounterUrl}
              isForProgramEncounters={isForProgramEncounters}
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
  loadProgramEncounters
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CompleteVisit)
  )
);
