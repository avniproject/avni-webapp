import React, { useEffect } from "react";
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
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { first } from "lodash";
import { setSubjectSearchParams, searchSubjects } from "../../reducers/searchReducer";
import RegistrationMenu from "./RegistrationMenu";
import PrimaryButton from "../../components/PrimaryButton";
import { EnhancedTableHead, stableSort, getComparator } from "../../components/TableHeaderSorting";
import { useTranslation } from "react-i18next";

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
    boxShadow: "none",
    backgroundColor: "#0e6eff"
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

const SubjectsTable = ({ type, subjects }) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  let tableHeaderName = [];
  let subjectsListObj = [];

  subjects.forEach(function(a) {
    let sub = {
      uuid: a.uuid,
      fullName: a.fullName,
      gender: a.gender ? t(a.gender.name) : "",
      dateOfBirth: a.dateOfBirth,
      addressLevel: a.addressLevel ? a.addressLevel.titleLineage : "",
      activePrograms: a.activePrograms
    };
    subjectsListObj.push(sub);
  });

  if (type.name === "Individual") {
    tableHeaderName = [
      { id: "fullName", numeric: false, disablePadding: true, label: "Name", align: "left" },
      { id: "gender", numeric: false, disablePadding: true, label: "Gender", align: "left" },
      {
        id: "dateOfBirth",
        numeric: true,
        disablePadding: false,
        label: "dateOfBirth",
        align: "left"
      },
      {
        id: "addressLevel",
        numeric: false,
        disablePadding: true,
        label: "location",
        align: "left"
      },
      {
        id: "activePrograms",
        numeric: false,
        disablePadding: true,
        label: "activeprograms",
        align: "left"
      }
    ];
  } else {
    tableHeaderName = [
      { id: "fullName", numeric: false, disablePadding: true, label: "Name", align: "left" },
      {
        id: "addressLevel",
        numeric: false,
        disablePadding: true,
        label: "Location",
        align: "left"
      },
      {
        id: "activePrograms",
        numeric: false,
        disablePadding: true,
        label: "Active Programs",
        align: "left"
      }
    ];
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = subjects.map(n => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // const handleClick = (event, name) => {
  //   const selectedIndex = selected.indexOf(name);
  //   let newSelected = [];

  //   if (selectedIndex === -1) {
  //     newSelected = newSelected.concat(selected, name);
  //   } else if (selectedIndex === 0) {
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     newSelected = newSelected.concat(
  //       selected.slice(0, selectedIndex),
  //       selected.slice(selectedIndex + 1)
  //     );
  //   }

  //   setSelected(newSelected);
  // };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = name => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, subjects.length - page * rowsPerPage);

  return (
    <div>
      {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
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
          rowCount={subjects.length}
        />
        <TableBody>
          {stableSort(subjectsListObj, getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => {
              // const isItemSelected = isSelected(row.name);
              return (
                <TableRow
                // hover
                // onClick={event => handleClick(event, row.name)}
                // role="checkbox"
                // aria-checked={isItemSelected}
                // tabIndex={-1}
                // key={row.name}
                // selected={isItemSelected}
                >
                  <TableCell component="th" scope="row" padding="none" width="20%">
                    <Link to={`/app/subject?uuid=${row.uuid}`}>{row.fullName}</Link>
                  </TableCell>
                  {type.name === "Individual" && (
                    <TableCell align="left" className={classes.cellpadding}>
                      {row.gender}
                    </TableCell>
                  )}
                  {type.name === "Individual" && (
                    <TableCell align="left" className={classes.cellpadding}>
                      {row.dateOfBirth}
                    </TableCell>
                  )}
                  <TableCell align="left" className={classes.cellpadding}>
                    {row.addressLevel}
                  </TableCell>
                  <TableCell align="left" width="25%" className={classes.cellpadding}>
                    {" "}
                    {row.activePrograms.map((p, key) => (
                      <Button
                        key={key}
                        size="small"
                        style={{
                          height: 20,
                          padding: 2,
                          margin: 2,
                          backgroundColor: p.colour,
                          color: "white",
                          fontSize: 11
                        }}
                        disabled
                      >
                        {t(p.operationalProgramName)}
                      </Button>
                    ))}
                  </TableCell>
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
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={subjectsListObj.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
};

const SubjectSearch = props => {
  const classes = useStyle();
  const { t } = useTranslation();

  const handleSubmit = event => {
    event.preventDefault();
    props.search();
  };

  useEffect(() => {
    props.search();
    sessionStorage.clear("subject");
  }, []);

  return (
    <Paper className={classes.searchBox}>
      <div className={classes.searchCreateToolbar}>
        <form onSubmit={handleSubmit} className={classes.searchForm}>
          <FormControl className={classes.searchFormItem}>
            <InputLabel htmlFor="search-field">{""}</InputLabel>
            <Input
              id="search-field"
              autoFocus
              type="text"
              value={props.searchParams.query}
              onChange={e => props.setSearchParams({ query: e.target.value })}
            />
          </FormControl>
          <FormControl className={classes.searchFormItem}>
            <PrimaryButton
              type={"submit"}
              onClick={handleSubmit}
              className={classes.searchBtnShadow}
            >
              {t("search")}
            </PrimaryButton>
          </FormControl>
        </form>
        <RegistrationMenu className={classes.createButtonHolder} />
      </div>
      <SubjectsTable subjects={props.subjects} type={props.subjectType} />
    </Paper>
  );
};

const mapStateToProps = state => {
  return {
    user: state.app.user,
    subjects: state.dataEntry.search.subjects,
    searchParams: state.dataEntry.search.subjectSearchParams,
    subjectType: first(state.dataEntry.metadata.operationalModules.subjectTypes)
  };
};

const mapDispatchToProps = {
  search: searchSubjects,
  setSearchParams: setSubjectSearchParams
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubjectSearch)
);
