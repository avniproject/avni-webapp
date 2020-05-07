import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableSortLabel,
  TablePagination,
  TableBody,
  TableCell,
  TableHead,
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
import {
  EnhancedTableHead,
  stableSort,
  descendingComparator,
  getComparator
} from "../../components/TableHeaderSorting";
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
  createButtonHolder: {
    flex: 1
  },
  searchBox: {
    padding: "1.5rem",
    margin: "2rem 1rem"
  }
}));

// const headCells = [
//   { id: 'fullName', numeric: false, disablePadding: true, label: 'Name' },
//   { id: 'gender', numeric: false, disablePadding: true, label: 'Gender' },
//   { id: 'dateOfBirth', numeric: true, disablePadding: false, label: 'Date of Birth' },
//   { id: 'addressLevel', numeric: false, disablePadding: true, label: 'Location' },
//   { id: 'activePrograms', numeric: false, disablePadding: true, label: 'Active Programs' },
// ];
// const headCells = headername;

// function descendingComparator(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// function getComparator(order, orderBy) {
//   return order === 'desc'
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy);
// }

// function stableSort(array, comparator) {
//   const stabilizedThis = array.map((el, index) => [el, index]);
//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//   return stabilizedThis.map((el) => el[0]);
// }

// function EnhancedTableHead(props) {

//   const {headername, classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
//   const createSortHandler = (property) => (event) => {
//     onRequestSort(event, property);
//   };
//   const headCells = headername;

//   return (
//     <TableHead>
//       <TableRow>
//         {headCells.map((headCell) => (
//           <TableCell
//             key={headCell.id}
//             align={headCell.numeric ? 'center' : 'center'}
//             padding={headCell.disablePadding ? 'none' : 'default'}
//             sortDirection={orderBy === headCell.id ? order : false}
//           >
//             <TableSortLabel
//               active={orderBy === headCell.id}
//               direction={orderBy === headCell.id ? order : 'asc'}
//               onClick={createSortHandler(headCell.id)}
//             >
//               {headCell.label}
//               {orderBy === headCell.id ? (
//                 <span className={classes.visuallyHidden}>
//                   {/* {order === 'desc' ? 'sorted descending' : 'sorted ascending'} */}
//                 </span>
//               ) : null}
//             </TableSortLabel>
//           </TableCell>
//         ))}
//       </TableRow>
//     </TableHead>
//   );
// }

// EnhancedTableHead.propTypes = {
//   headername: PropTypes.object.isRequired,
//   classes: PropTypes.object.isRequired,
//   numSelected: PropTypes.number.isRequired,
//   onRequestSort: PropTypes.func.isRequired,
//   onSelectAllClick: PropTypes.func.isRequired,
//   order: PropTypes.oneOf(['asc', 'desc']).isRequired,
//   orderBy: PropTypes.string.isRequired,
//   rowCount: PropTypes.number.isRequired,
// };

const SubjectsTable = ({ type, subjects }) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  let subjectsListObj = [];
  //  var arr1 = [{ name: 'fred', id:23 }, { name: 'bill' }, { name: 'ted' }, { name: 'james' }],
  //   arr2 = [{ name: 'toString' }, { name: 'spil' }, { name: 'fred' }, { name: 'bill' }, { name: 'paul' }, { name: 'stone' }],
  //   hash = Object.create(null);

  // arr1.forEach(function (a) {
  //     hash[a.name] = true;
  // });
  subjects.forEach(function(a) {
    let sub = {
      fullName: a.fullName,
      gender: a.gender ? t(a.gender.name) : "",
      dateOfBirth: a.dateOfBirth,
      addressLevel: a.addressLevel ? a.addressLevel.titleLineage : "",
      activePrograms: a.activePrograms
    };
    subjectsListObj.push(sub);
  });
  // let genderName = row.gender ? t(row.gender.name) : "";
  // let addressLevel = row.addressLevel ? row.addressLevel.titleLineage : "";

  // console.log("arr1----------",arrObj);
  // console.log("subjects----------",subjects);
  //  subjects.map((n) => {"name":n.fullName,
  //   "dateOfBirth":n.dateOfBirth,
  //   "activePrograms":n.activePrograms,
  //   "addressLevel":n.addressLevel ? n.addressLevel.titleLineage : "",
  //   "gender" : n.gender ? t(n.gender.name) : ""
  // })];

  // console.log("arrObj---------------->",arrObj)
  let tableHeaderName = [];
  if (type.name === "Individual") {
    tableHeaderName = [
      { id: "fullName", numeric: false, disablePadding: true, label: "Name" },
      { id: "gender", numeric: false, disablePadding: true, label: "Gender" },
      { id: "dateOfBirth", numeric: true, disablePadding: false, label: "Date of Birth" },
      { id: "addressLevel", numeric: false, disablePadding: true, label: "Location" },
      { id: "activePrograms", numeric: false, disablePadding: true, label: "Active Programs" }
    ];
  } else {
    tableHeaderName = [
      { id: "fullName", numeric: false, disablePadding: true, label: "Name" },
      { id: "addressLevel", numeric: false, disablePadding: true, label: "Location" },
      { id: "activePrograms", numeric: false, disablePadding: true, label: "Active Programs" }
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

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
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
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handleChangeDense = (event) => {
  //   setDense(event.target.checked);
  // };

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
              const isItemSelected = isSelected(row.name);
              let genderName = row.gender ? t(row.gender.name) : "";
              let addressLevel = row.addressLevel ? row.addressLevel.titleLineage : "";
              // const labelId = `enhanced-table-checkbox-${index}`;
              return (
                <TableRow
                  hover
                  onClick={event => handleClick(event, row.name)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.name}
                  selected={isItemSelected}
                >
                  <TableCell component="th" scope="row" padding="none" align="center" width="20%">
                    <Link to={`/app/subject?uuid=${row.uuid}`}>{row.fullName}</Link>
                  </TableCell>
                  {type.name === "Individual" && <TableCell align="center">{row.gender}</TableCell>}
                  {type.name === "Individual" && (
                    <TableCell align="center">{row.dateOfBirth}</TableCell>
                  )}
                  <TableCell align="center">{row.addressLevel}</TableCell>
                  <TableCell align="center" width="25%">
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
            <PrimaryButton type={"submit"} onClick={handleSubmit}>
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
