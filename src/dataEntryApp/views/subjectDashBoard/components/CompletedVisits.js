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
import Typography from "@material-ui/core/Typography";
import { withRouter, Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { withParams } from "../../../../common/components/utils";
import { getCompletedVisit, getEnrolments, types } from "../../../reducers/completedVisitsReducer";
import { mapObservation } from "../../../../common/subjectModelMapper";
import Observations from "../../../../common/components/Observations";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import FilterResult from "../components/FilterResult";
import { enableReadOnly } from "common/constants";
import moment from "moment/moment";
import {
  EnhancedTableHead,
  stableSort,
  getComparator
} from "../../../../dataEntryApp/components/TableHeaderSorting";
import { store } from "../../../../common/store/createStore";

const useStyle = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(3),
    overflowX: "auto"
  },
  table: {
    minWidth: 1000,
    //  boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.3)",
    //  borderRadius: "3px",
    padding: "5px"
  },
  completedVsits: {
    fontWeight: "550",
    fontSize: "21px"
  },
  resultFound: {
    fontWeight: "500"
  },
  tableheader: {
    color: "rgba(0, 0, 0, 4.54)",
    fontSize: "0.75rem",
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
  cellpadding: {
    padding: "14px 40px 14px 0px"
  },
  Typography: {
    fontSize: "12px"
  }
}));

const CompletedVisitsTable = ({ allVisits }) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  // const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  let tableHeaderName = [];
  let allVisitsListObj = [];
  if (enableReadOnly) {
    tableHeaderName = [
      { id: "name", numeric: false, disablePadding: true, label: "visitName", align: "left" },
      {
        id: "encounterDateTime",
        numeric: false,
        disablePadding: true,
        label: "visitcompleteddate",
        align: "left"
      },
      {
        id: "earliestVisitDateTime",
        numeric: true,
        disablePadding: false,
        label: "visitscheduledate",
        align: "left"
      }
    ];
  } else {
    tableHeaderName = [
      { id: "name", numeric: false, disablePadding: true, label: "visitName", align: "left" },
      {
        id: "encounterDateTime",
        numeric: false,
        disablePadding: true,
        label: "visitcompleteddate",
        align: "left"
      },
      {
        id: "earliestVisitDateTime",
        numeric: true,
        disablePadding: false,
        label: "visitscheduledate",
        align: "left"
      },
      {
        id: "action",
        numeric: false,
        disablePadding: true,
        label: "action",
        align: "left"
      }
    ];
  }

  if (allVisits && allVisits.content) {
    allVisits.content.forEach(function(a) {
      let sub = {
        uuid: a.uuid,
        name: a.encounterType.name ? a.encounterType.name : "-",
        earliestVisitDateTime: a.earliestVisitDateTime
          ? moment(a.earliestVisitDateTime).format("DD-MM-YYYY")
          : "-",
        encounterDateTime: a.encounterDateTime
          ? moment(a.encounterDateTime).format("DD-MM-YYYY")
          : "-",
        observations: mapObservation(a.observations)
      };
      allVisitsListObj.push(sub);
    });
  }
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = allVisitsListObj.map(n => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 5));
    setPage(0);
  };
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, allVisitsListObj.length - page * rowsPerPage);

  return allVisitsListObj ? (
    <div>
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        size={dense ? "small" : "medium"}
        aria-label="enhanced table"
      >
        <EnhancedTableHead
          headername={tableHeaderName}
          classes={classes}
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          onRequestSort={handleRequestSort}
          rowCount={allVisitsListObj.length}
        />
        <TableBody>
          {stableSort(allVisitsListObj, getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => {
              return (
                <TableRow>
                  <TableCell component="th" scope="row" padding="none" width="30%">
                    <Link to={`/app/subject/viewVisit?uuid=${row.uuid}`}>{t(row.name)}</Link>
                  </TableCell>

                  <TableCell align="left" className={classes.cellpadding}>
                    {row.encounterDateTime}
                  </TableCell>
                  <TableCell align="left" className={classes.cellpadding}>
                    {row.earliestVisitDateTime}
                  </TableCell>

                  {!enableReadOnly ? (
                    <TableCell align="left" className={classes.cellpadding}>
                      {" "}
                      <Link to="">
                        {t("edit")} {t("visit")}
                      </Link>
                    </TableCell>
                  ) : (
                    ""
                  )}
                </TableRow>
              );
            })}
          {emptyRows > 0 && (
            <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={allVisitsListObj.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  ) : (
    ""
  );
};

const CompleteVisit = ({
  match,
  getCompletedVisit,
  getEnrolments,
  completedVisit,
  enrolments,
  enrolldata
}) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const history = useHistory();

  store.dispatch({ type: types.ADD_ENROLLDATA, value: enrolldata });

  const completedVisitUrl = `/web/programEnrolment/${match.queryParams.uuid}/completed`;

  useEffect(() => {
    getCompletedVisit(completedVisitUrl);
    getEnrolments(match.queryParams.uuid);
  }, []);

  return completedVisit && enrolments ? (
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
                  {completedVisit ? completedVisit.content.length : ""} {t("resultfound")}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={6} container direction="row" justify="flex-end" alignItems="flex-start">
              <FilterResult enrolments={enrolments} />
            </Grid>
          </Grid>
          <Paper className={classes.tableBox}>
            <CompletedVisitsTable allVisits={completedVisit} />
          </Paper>
        </Paper>
      </Fragment>
    </div>
  ) : (
    ""
  );
};

const mapStateToProps = state => {
  return {
    completedVisit: state.dataEntry.completedVisitsReducer.completedVisits,
    enrolments: state.dataEntry.completedVisitsReducer.enrolments,
    enrolldata: state.dataEntry.completedVisitsReducer.enrolldata
  };
};

const mapDispatchToProps = {
  getCompletedVisit,
  getEnrolments
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CompleteVisit)
  )
);
