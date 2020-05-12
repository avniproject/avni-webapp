import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TablePagination,
  TableBody,
  TableCell,
  TableRow,
  FormControl,
  InputLabel,
  Input,
  Button,
  Paper
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import TableHead from "@material-ui/core/TableHead";
import Typography from "@material-ui/core/Typography";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
// import { LineBreak, RelativeLink, withParams } from "../../../common/components/utils";

import { LineBreak, RelativeLink, withParams } from "../../../../common/components/utils";
import { first } from "lodash";
import { setSubjectSearchParams, searchSubjects } from "../../../reducers/searchReducer";
import { getCompletedVisit, getVisitTypes } from "../../../reducers/completedVisitReducer";
import RegistrationMenu from "../../search/RegistrationMenu";
import PrimaryButton from "../../../components/PrimaryButton";
import {
  EnhancedTableHead,
  stableSort,
  getComparator
} from "../../../components/TableHeaderSorting";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import FilterResult from "../components/FilterResult";

const useStyle = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(3),
    overflowX: "auto"
  },
  table: {
    minWidth: 1000
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
    margin: "2rem 1rem"
  },
  cellpadding: {
    padding: "14px 40px 14px 0px"
  }
}));

const SubjectsTable = ({ completedVisit }) => {
  const classes = useStyle();
  // console.log("subjects----------------->", subjects)
  const { t } = useTranslation();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  let tableHeaderName = [
    { id: "", numeric: false, disablePadding: true, label: "", align: "" },
    { id: "name", numeric: false, disablePadding: true, label: "Visit Name", align: "left" },
    {
      id: "earliestVisitDateTime",
      numeric: true,
      disablePadding: false,
      label: "Visit Completed Date",
      align: "left"
    },
    {
      id: "encounterDateTime",
      numeric: true,
      disablePadding: false,
      label: "Visit Scheduled Datell",
      align: "left"
    },
    {
      id: "activePrograms",
      numeric: false,
      disablePadding: true,
      label: "action",
      align: "left"
    }
  ];
  let subjectsListObj = completedVisit;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // const handleSelectAllClick = event => {
  //   if (event.target.checked) {
  //     const newSelecteds = subjects.map(n => n.name);
  //     setSelected(newSelecteds);
  //     return;
  //   }
  //   setSelected([]);
  // };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = name => selected.indexOf(name) !== -1;

  //   const emptyRows = rowsPerPage - Math.min(rowsPerPage, subjects.length - page * rowsPerPage);

  return completedVisit ? (
    <div>
      {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        size={dense ? "small" : "medium"}
        aria-label="enhanced table"
      >
        {/* <EnhancedTableHead
          headername={tableHeaderName}
          classes={classes}
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          onRequestSort={handleRequestSort}
          rowCount={subjectsListObj.content.length}
        /> */}
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Visit Name</TableCell>
            <TableCell align="left">Visit Completed Date</TableCell>
            <TableCell align="left">Visit Scheduled Date</TableCell>
            <TableCell align="left">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subjectsListObj &&
            subjectsListObj.content.map(row => (
              // <Row key={row.uuid} row={row} />
              <React.Fragment>
                <TableRow className={classes.root}>
                  <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                      {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.encounterType.name}
                  </TableCell>
                  <TableCell align="left">{row.earliestVisitDateTime}</TableCell>
                  <TableCell align="left">{row.encounterDateTime}</TableCell>
                  <TableCell align="left">{row.carbs}</TableCell>
                  {/* <TableCell align="right">{row.protein}</TableCell> */}
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="h6" gutterBottom component="div">
                          History
                        </Typography>
                        <Table size="small" aria-label="purchases">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Value</TableCell>
                              {/* <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Total price ($)</TableCell> */}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.observations.map(historyRow => (
                              <TableRow key={historyRow.date}>
                                <TableCell component="th" scope="row">
                                  {historyRow.concept.name}
                                </TableCell>
                                <TableCell align="left">{historyRow.value.name}</TableCell>
                                {/* <TableCell align="left">{historyRow.value.uuid}</TableCell>
                          <TableCell align="left">{historyRow.value.name}</TableCell> */}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={subjectsListObj.content.length}
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

const CompleteVisit = ({ match, getCompletedVisit, getVisitTypes, completedVisit }) => {
  console.log("props-------", match);
  console.log("getCompletedVisit-------", getCompletedVisit);
  console.log("completedVisit-------", completedVisit);
  const classes = useStyle();
  const { t } = useTranslation();

  // const handleSubmit = event => {
  //   event.preventDefault();
  //   props.search();
  // };

  useEffect(() => {
    getCompletedVisit(match.params.id);
    getVisitTypes(match.params.uuid);
  }, []);

  const visitTypes1 = ["Birth", "Naturals", "death"];

  return (
    <div>
      <Fragment>
        <Breadcrumbs path={match.path} />
        {/* {paperInfo} */}

        <Paper className={classes.searchBox}>
          <Grid container spacing={3}>
            <Grid item xs={6} alignItems="left">
              <div align="left">
                {/* <h1>Completed visits </h1> */}
                <Typography variant="h6" gutterBottom>
                  Completed visits
                </Typography>
                {/* <h5>20 Results found</h5> */}
                <Typography variant="subtitle1" gutterBottom>
                  20 Results found
                </Typography>
              </div>
            </Grid>
            <Grid item xs={6} container direction="row" justify="flex-end" alignItems="flex-start">
              <FilterResult visitTypes={visitTypes1} />
            </Grid>
          </Grid>
          <SubjectsTable subjects={completedVisit} />
        </Paper>
      </Fragment>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    completedVisit: state.dataEntry.completedVisitReducer.completedVisits,
    visitTypes: state.dataEntry.completedVisitReducer.visitTypes
  };
};

// const mapDispatchToProps = {
//   search: searchSubjects,
//   setSearchParams: setSubjectSearchParams
// };
const mapDispatchToProps = {
  getCompletedVisit,
  getVisitTypes
};

export default withRouter(
  // connect(
  //   mapStateToProps,
  //   mapDispatchToProps
  // )(CompleteVisit)
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CompleteVisit)
  )
);
