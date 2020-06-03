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
import { mapObservation } from "../../../../common/subjectModelMapper";
import Observations from "../../../../common/components/Observations";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import FilterResult from "../components/FilterResult";
import moment from "moment/moment";
import {
  EnhancedTableHead,
  stableSort,
  getComparator
} from "../../../../dataEntryApp/components/TableHeaderSorting";
import { TablePaginationActions } from "../../../../dataEntryApp/components/TablePagination";
import { store } from "../../../../common/store/createStore";
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
  Typography: {
    fontSize: "12px"
  }
}));

const Row = props => {
  const { t } = useTranslation();
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useStyle();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell component="th" scope="row" padding="none" width="30%">
          <Link
            to={
              props.isForProgramEncounters
                ? `/app/subject/viewProgramEncounter?uuid=${row.uuid}`
                : `/app/subject/viewEncounter?uuid=${row.uuid}`
            }
          >
            {t(row.name)}
          </Link>
        </TableCell>
        <TableCell align="left">{row.encounterDateTime}</TableCell>
        <TableCell align="left">{row.earliestVisitDateTime}</TableCell>
        {!props.enableReadOnly ? (
          <TableCell align="left">
            {" "}
            <Link to="">
              {t("edit")} {t("visit")}
            </Link>
          </TableCell>
        ) : (
          ""
        )}
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                {t("summary")}
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableBody>
                  <List>
                    <Observations observations={row.observations ? row.observations : ""} />
                  </List>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const CompletedVisitsTable = ({
  allVisits,
  enableReadOnly,
  isForProgramEncounters,
  match,
  loadProgramEncounters,
  loadEncounters,
  load
}) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const [order, setOrder] = React.useState("");
  const [orderBy, setOrderBy] = React.useState("name");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  let totalVisits = allVisits ? allVisits.totalElements : 0;
  let tableHeaderName = [];
  let allVisitsListObj = [];
  let sortfields = "";

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
      },
      {
        id: "",
        numeric: false,
        disablePadding: true,
        label: "",
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
        name: a.encounterType ? a.encounterType.name : "-",
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
    let filterParams = {};
    filterParams.page = page;
    filterParams.size = rowsPerPage;
    filterParams.sort = property + "," + order;
    let SearchParamsFilter = new URLSearchParams(filterParams);
    let filterQueryString = SearchParamsFilter.toString();
    isForProgramEncounters
      ? loadProgramEncounters(match.queryParams.uuid, filterQueryString)
      : loadEncounters(match.queryParams.uuid, filterQueryString);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    let filterParams = {};
    filterParams.page = newPage;
    filterParams.size = rowsPerPage;
    filterParams.sort = orderBy + "," + order;
    let SearchParamsFilter = new URLSearchParams(filterParams);
    let filterQueryString = SearchParamsFilter.toString();
    isForProgramEncounters
      ? loadProgramEncounters(match.queryParams.uuid, filterQueryString)
      : loadEncounters(match.queryParams.uuid, filterQueryString);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    let filterParams = {};
    filterParams.page = 0;
    filterParams.size = event.target.value;
    filterParams.sort = orderBy + "," + order;
    let SearchParamsFilter = new URLSearchParams(filterParams);
    let filterQueryString = SearchParamsFilter.toString();
    isForProgramEncounters
      ? loadProgramEncounters(match.queryParams.uuid, filterQueryString)
      : loadEncounters(match.queryParams.uuid, filterQueryString);
  };

  return (
    <div>
      <CustomizedBackdrop load={load} />
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
          onRequestSort={handleRequestSort}
          rowCount={allVisitsListObj.length}
        />
        <TableBody>
          {stableSort(allVisitsListObj, getComparator(order, orderBy)).map(row => (
            <Row
              key={row.name}
              row={row}
              isForProgramEncounters={isForProgramEncounters}
              enableReadOnly={enableReadOnly}
              loadProgramEncounters={loadProgramEncounters}
              loadEncounters={loadEncounters}
            />
          ))}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={totalVisits}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
      />
    </div>
  );
};

export default CompletedVisitsTable;
