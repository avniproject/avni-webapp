import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Modal from "./CommonModal";
import { noop, isNil, isEmpty, first } from "lodash";
// import { first } from "lodash";
import { connect } from "react-redux";
import { withRouter, useHistory } from "react-router-dom";
// import TableContainer from '@material-ui/core/TableContainer';
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import Radio from "@material-ui/core/Radio";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import { useTranslation } from "react-i18next";
import { Row } from "reactstrap";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 750
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1
  }
}));

const FindRelativeTable = ({ subjectData }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  // const [order, setOrder] = React.useState("asc");
  // const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  // const [page, setPage] = React.useState(0);
  // const [dense, setDense] = React.useState(false);
  // const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [value, setValue] = React.useState("");

  let selectedRelatives = [];

  const handleClick = (event, uuid, row) => {
    const selectedIndex = selected.indexOf(uuid);
    console.log("selectedIndex=====>", selectedIndex);
    console.log("selectedIndex=====>", uuid);
    console.log("selectedIndex=====>", row);
    let newSelected = [];
    let sub = row;
    console.log("sub======selectedIndex=====>", sub);

    // sessionStorage.setItem("selectedRelatives", sub);
    sessionStorage.setItem("selectedRelative", JSON.stringify(sub));

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, uuid);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = uuid => selected.indexOf(uuid) !== -1;
  const close = () => {
    // if (!moment(selectedScheduleDate).isValid()) setSelectedScheduleDate(null);
    // if (!moment(selectedCompletedDate).isValid()) setSelectedCompletedDate(null);
    // filterErrors["RELATIVE_NAME"] = "";
    // filterErrors["SCHEDULED_DATE"] = "";
    // setfilterErrors({ ...filterErrors });
  };
  const applyClick = () => {
    console.log("Valuee------", value);
    // props.search({ query: value });
    // let filterParams = {};
    // if (selectedScheduleDate != null) {
    //   let dateformat = moment(selectedScheduleDate).format("YYYY-MM-DD");
    //   let earliestVisitDateTime = moment(dateformat).format("YYYY-MM-DDT00:00:00.000") + "Z";
    //   filterParams.earliestVisitDateTime = earliestVisitDateTime;
    // }
    // if (selectedCompletedDate != null) {
    //   let dateformat = moment(selectedCompletedDate).format("YYYY-MM-DD");
    //   let encounterDateTime = moment(dateformat).format("YYYY-MM-DDT00:00:00.000") + "Z";
    //   filterParams.encounterDateTime = encounterDateTime;
    // }

    // const SelectedvisitTypesListSort =
    //   selectedVisitTypes != null
    //     ? Object.keys(selectedVisitTypes)
    //         .filter(selectedId => selectedVisitTypes[selectedId])
    //         .map(String)
    //     : [];

    // if (SelectedvisitTypesListSort.length > 0) {
    //   const SelectedvisitTypesList = [...new Set(SelectedvisitTypesListSort.map(item => item))];
    //   filterParams.encounterTypeUuids = SelectedvisitTypesList.join();
    // }
    // setFilterParams(filterParams);
  };

  const searchContentTable = (
    <div className={classes.root}>
      {/* <Paper className={classes.paper}> */}
      <Typography variant="subtitle2" gutterBottom>
        {subjectData && subjectData.content ? subjectData.content.length : ""} Result selected
      </Typography>
      {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
      {/* <TableContainer> */}
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        // size={dense ? "small" : "medium"}
        aria-label="enhanced table"
      >
        {/* <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            /> */}

        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">Age</TableCell>
            <TableCell align="left">Village</TableCell>
            <TableCell align="left">Subject type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subjectData &&
            subjectData.content.map((row, index) => {
              const isItemSelected = isSelected(row.uuid);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  onClick={event => handleClick(event, row.uuid, row)}
                  role="radio"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.uuid}
                  selected={isItemSelected}
                >
                  <TableCell padding="radio">
                    <Radio checked={isItemSelected} inputProps={{ "aria-labelledby": labelId }} />
                  </TableCell>
                  {/* <TableCell component="th" id={labelId} scope="row" padding="none">
                        {row.name}
                      </TableCell> */}
                  <TableCell align="left" scope="row" id={labelId}>
                    {row.fullName}
                  </TableCell>
                  <TableCell align="left">{row.dateOfBirth}</TableCell>
                  <TableCell align="left">{row.addressLevel.title}</TableCell>
                  <TableCell align="left">{row.subjectType.name}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      {/* </Paper> */}
    </div>
  );

  return (
    // <Modal
    //   // content={props.subjects && props.subjects.content ?searchContent:searchDetailTable}
    //   content={searchContentTable}
    //   handleError={noop}
    //   buttonsSet={[
    //     {
    //       buttonType: "openButton",
    //       label: t("filterResults"),
    //       classes: classes.filterButtonStyle
    //     },
    //     {
    //       buttonType: "applyButton",
    //       label: "OK",
    //       classes: classes.btnCustom,
    //       // redirectTo: <FindRelativeTable subjectData={props.subjects} />,
    //       click: applyClick
    //       // disabled:
    //       //   !isEmpty(filterErrors["RELATIVE_NAME"]) || !isEmpty(filterErrors["SCHEDULED_DATE"])
    //     },
    //     {
    //       buttonType: "cancelButton",
    //       // label: t("cancel"),
    //       label: "MODIFY SEARCH",
    //       classes: classes.cancelBtnCustom
    //     }
    //   ]}
    //   title="Find Relative"
    //   btnHandleClose={close}
    // />
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="subtitle2" gutterBottom>
          {subjectData && subjectData.content ? subjectData.content.length : ""} Result selected
        </Typography>
        {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
        {/* <TableContainer> */}
        <Table
          className={classes.table}
          aria-labelledby="tableTitle"
          // size={dense ? "small" : "medium"}
          aria-label="enhanced table"
        >
          {/* <EnhancedTableHead
            classes={classes}
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          /> */}

          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Age</TableCell>
              <TableCell align="left">Village</TableCell>
              <TableCell align="left">Subject type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjectData &&
              subjectData.content.map((row, index) => {
                const isItemSelected = isSelected(row.uuid);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={event => handleClick(event, row.uuid, row)}
                    role="radio"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.uuid}
                    selected={isItemSelected}
                  >
                    <TableCell padding="radio">
                      <Radio checked={isItemSelected} inputProps={{ "aria-labelledby": labelId }} />
                    </TableCell>
                    {/* <TableCell component="th" id={labelId} scope="row" padding="none">
                      {row.name}
                    </TableCell> */}
                    <TableCell align="left" scope="row" id={labelId}>
                      {row.fullName}
                    </TableCell>
                    <TableCell align="left">{row.dateOfBirth}</TableCell>
                    <TableCell align="left">{row.addressLevel.title}</TableCell>
                    <TableCell align="left">{row.subjectType.name}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};
const mapStateToProps = state => ({
  Relations: state.dataEntry.relations,
  subjects: state.dataEntry.search.subjects,
  searchParams: state.dataEntry.search.subjectSearchParams,
  subjectTypes: first(state.dataEntry.metadata.operationalModules.subjectTypes)
});

const mapDispatchToProps = {
  // search: searchSubjects
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FindRelativeTable)
);
