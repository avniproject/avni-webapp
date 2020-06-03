import React, { Fragment, useEffect } from "react";
import {
  Table,
  TablePagination,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  List
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Typography from "@material-ui/core/Typography";
import { withRouter, Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { withParams } from "../../../../common/components/utils";
import { loadEncounters, loadProgramEncounters } from "../../../reducers/completedVisitsReducer";
import { mapObservation } from "../../../../common/subjectModelMapper";
import Observations from "../../../../common/components/Observations";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import FilterResult from "../components/FilterResult";
import CompletedVisitsTable from "./CompletedVisitsTable";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const useStyle = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(3),
    overflowX: "auto"
  },
  table: {
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
  enableReadOnly,
  encounterTypes,
  load,
  loadProgramEncounters,
  loadEncounters
}) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  let totalVisits = completedVisits ? completedVisits.totalElements : "";
  let filterParams = {};
  filterParams.page = 0;
  filterParams.size = rowsPerPage;
  const SearchParamsFilter = new URLSearchParams(filterParams);
  const filterQueryString = SearchParamsFilter.toString();
  const isForProgramEncounters = match.path === "/app/subject/completedProgramEncounters";

  useEffect(() => {
    isForProgramEncounters
      ? loadProgramEncounters(match.queryParams.uuid, filterQueryString)
      : loadEncounters(match.queryParams.uuid, filterQueryString);
  }, []);

  return completedVisits && load ? (
    <div>
      <Fragment>
        <Breadcrumbs path={match.path} />
        <Paper className={classes.searchBox}>
          <Grid container spacing={3}>
            <Grid item xs={6} alignItems="left">
              <div align="left">
                <Typography variant="h6" gutterBottom className={classes.completedVsits}>
                  {t("completedVisits")}
                </Typography>
                <Typography variant="subtitle1" gutterBottom className={classes.resultFound}>
                  {totalVisits} {t("resultfound")}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={6} container direction="row" justify="flex-end" alignItems="flex-start">
              <FilterResult
                isForProgramEncounters={isForProgramEncounters}
                entityUuid={match.queryParams.uuid}
                encounterTypes={encounterTypes}
              />
            </Grid>
          </Grid>
          <Paper className={classes.tableBox}>
            <CompletedVisitsTable
              isForProgramEncounters={isForProgramEncounters}
              allVisits={completedVisits}
              enableReadOnly={enableReadOnly}
              match={match}
              loadProgramEncounters={loadProgramEncounters}
              loadEncounters={loadEncounters}
              load={load}
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
    completedVisits: state.dataEntry.completedVisitsReducer.completedVisits,
    encounterTypes: state.dataEntry.completedVisitsReducer.encounterTypes,
    enableReadOnly: state.app.userInfo.settings.dataEntryAppReadonly,
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
