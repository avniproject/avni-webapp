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
import { first } from "lodash";
import { setSubjectSearchParams, searchSubjects } from "../../../reducers/searchReducer";
import RegistrationMenu from "../../search/RegistrationMenu";
import PrimaryButton from "../../../components/PrimaryButton";
import {
  EnhancedTableHead,
  stableSort,
  getComparator
} from "../../../components/TableHeaderSorting";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";

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

function createData(name, calories, fat, carbs, protein, price) {
  return {
    name,
    calories,
    fat,
    carbs,
    protein,
    price,
    history: [
      { date: "2020-01-05", customerId: "11091700", amount: 3 },
      { date: "2020-01-02", customerId: "Anonymous", amount: 1 }
    ]
  };
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useStyle();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.calories}</TableCell>
        <TableCell align="right">{row.fat}</TableCell>
        <TableCell align="right">{row.carbs}</TableCell>
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
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Total price ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map(historyRow => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align="right">{historyRow.amount}</TableCell>
                      <TableCell align="right">
                        {Math.round(historyRow.amount * row.price * 100) / 100}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    calories: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        customerId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired
      })
    ).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired
    // protein: PropTypes.number.isRequired,
  }).isRequired
};

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0, 3.99),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3, 4.99),
  createData("Eclair", 262, 16.0, 24, 6.0, 3.79),
  createData("Cupcake", 305, 3.7, 67, 4.3, 2.5),
  createData("Gingerbread", 356, 16.0, 49, 3.9, 1.5)
];

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
  let subjectsListObj = {
    content: [
      {
        uuid: "12be7fec-9ff3-4b8a-9029-5576a3643146",
        earliestVisitDateTime: "2020-02-06T05:00:00.000Z",
        encounterType: {
          name: "Nutritional status and Morbidity",
          uuid: "0126df9e-0167-4d44-9a2a-ae41cfc58d3d"
        },
        encounterDateTime: "2020-02-06T10:35:15.000Z",
        observations: [
          {
            concept: {
              name: "Whether having cough and cold",
              uuid: "e6bd3ca9-caed-462a-bf7a-1614269ebeaa",
              dataType: "Coded"
            },
            value: {
              name: "No",
              uuid: "e7b50c78-3d90-484d-a224-9887887780dc",
              dataType: "NA"
            }
          },
          {
            concept: {
              name: "Weight",
              uuid: "75b1656e-2777-4753-9612-ce03a766a5e1",
              dataType: "Numeric"
            },
            value: 6
          },
          {
            concept: {
              name: "Baby has got diarrohea",
              uuid: "d7ae84be-0642-4e46-9d91-699574082abb",
              dataType: "Coded"
            },
            value: {
              name: "No",
              uuid: "e7b50c78-3d90-484d-a224-9887887780dc",
              dataType: "NA"
            }
          },
          {
            concept: {
              name:
                "Is current weight of the child equal to or less than the previous months weight?",
              uuid: "158d59f3-5933-46ea-9601-7008047ea079",
              dataType: "Coded"
            },
            value: {
              name: "Yes",
              uuid: "04bb1773-c353-44a1-a68c-9b448e07ff70",
              dataType: "NA"
            }
          },
          {
            concept: {
              name: "Child has fever",
              uuid: "d5bb90bd-f597-4978-8657-15af7c04621b",
              dataType: "Coded"
            },
            value: {
              name: "No",
              uuid: "e7b50c78-3d90-484d-a224-9887887780dc",
              dataType: "NA"
            }
          }
        ],
        cancelObservations: []
      },
      {
        uuid: "e8a06345-3710-4ad7-92a3-69f1711a7b7a",
        earliestVisitDateTime: "2020-02-06T05:00:00.000Z",
        encounterType: {
          name: "Birth (ASHA)",
          uuid: "badd43fa-6346-436e-8fbc-9055be2754c9"
        },
        encounterDateTime: "2020-02-12T05:00:00.000Z",
        observations: [
          {
            concept: {
              name: "Date of first weight taken of the child",
              uuid: "c269ed4a-1855-4516-8fa3-362a3ef28dea",
              dataType: "Date"
            },
            value: "2020-02-12T05:00:00.000Z"
          },
          {
            concept: {
              name: "Time when breast feeding initiated to the newborn",
              uuid: "b99caee7-a97a-4ce4-970b-ee567dfea070",
              dataType: "Coded"
            },
            value: {
              name: "Within 1 hour after birth",
              uuid: "11e25d80-b56a-43c5-a58d-f5a079f07c9e",
              dataType: "NA"
            }
          },
          {
            concept: {
              name: "Birth Weight",
              uuid: "7ff327c5-8678-41e3-af39-c86f214c6f14",
              dataType: "Numeric"
            },
            value: 2
          },
          {
            concept: {
              name: "First feed given to the newborn",
              uuid: "44772c48-4182-4803-b34a-8a516f4fe7d5",
              dataType: "Coded"
            },
            value: {
              name: "Other",
              uuid: "05ea583c-51d2-412d-ad00-06c432ffe538",
              dataType: "NA"
            }
          },
          {
            concept: {
              name: "Place of birth",
              uuid: "fc3f9353-3cf3-426c-91fa-96e5900fd8af",
              dataType: "Coded"
            },
            value: {
              name: "Home",
              uuid: "bb75a86c-05af-4b05-b699-860737d19e57",
              dataType: "NA"
            }
          },
          {
            concept: {
              name: "Gestational age category at birth",
              uuid: "24c71448-1068-4dc2-aa2f-8bbb66a5123f",
              dataType: "Coded"
            },
            value: {
              name: "Term (37 -38 weeks)",
              uuid: "61612a0b-72db-46a8-97d5-d9994d86118f",
              dataType: "NA"
            }
          }
        ],
        cancelObservations: []
      }
    ],
    pageable: {
      sort: {
        sorted: false,
        unsorted: true
      },
      pageSize: 20,
      pageNumber: 0,
      offset: 0,
      paged: true,
      unpaged: false
    },
    last: true,
    totalElements: 2,
    totalPages: 1,
    first: true,
    sort: {
      sorted: false,
      unsorted: true
    },
    numberOfElements: 2,
    size: 20,
    number: 0
  };

  // subjects.forEach(function (a) {
  //     let sub = {
  //         uuid: a.uuid,
  //         fullName: a.fullName,
  //         gender: a.gender ? t(a.gender.name) : "",
  //         dateOfBirth: a.dateOfBirth,
  //         addressLevel: a.addressLevel ? a.addressLevel.titleLineage : "",
  //         activePrograms: a.activePrograms
  //     };
  //     subjectsListObj.push(sub);
  // });

  // if (type.name === "Individual") {
  //     tableHeaderName = [
  //         { id: "fullName", numeric: false, disablePadding: true, label: "visit name", align: "left" },
  //         { id: "gender", numeric: false, disablePadding: true, label: "Visit compleated date", align: "left" },
  //         {
  //             id: "dateOfBirth",
  //             numeric: true,
  //             disablePadding: false,
  //             label: "visit scheduled date",
  //             align: "left"
  //         },
  //         {
  //             id: "activePrograms",
  //             numeric: false,
  //             disablePadding: true,
  //             label: "action",
  //             align: "left"
  //         }
  //     ];
  // } else {
  //     tableHeaderName = [
  //         { id: "fullName", numeric: false, disablePadding: true, label: "Name", align: "left" },
  //         {
  //             id: "addressLevel",
  //             numeric: false,
  //             disablePadding: true,
  //             label: "Location",
  //             align: "left"
  //         },
  //         {
  //             id: "activePrograms",
  //             numeric: false,
  //             disablePadding: true,
  //             label: "Active Programs",
  //             align: "left"
  //         }
  //     ];
  // }

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
        {/* <EnhancedTableHead
          headername={tableHeaderName}
          classes={classes}
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          onRequestSort={handleRequestSort}
          rowCount={subjects.length}
        /> */}
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Visit Name</TableCell>
            <TableCell align="right">Visit Completed Date</TableCell>
            <TableCell align="right">Visit Scheduled Date</TableCell>
            <TableCell align="right">Action</TableCell>
            {/* <TableCell align="right">Protein&nbsp;(g)</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <Row key={row.name} row={row} />
          ))}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
};

const CompleteVisit = props => {
  console.log("props-------", props);
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
    <div>
      <Fragment>
        <Breadcrumbs path={props.match.path} />
        {/* {paperInfo} */}

        <Paper className={classes.searchBox}>
          <div className={classes.searchCreateToolbar}>
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
              <Grid item xs={6} alignItems="right">
                <div align="right">
                  <PrimaryButton
                    type={"submit"}
                    onClick={handleSubmit}
                    className={classes.searchButtonStyle}
                  >
                    {t("filter result")}
                  </PrimaryButton>
                </div>
              </Grid>
            </Grid>

            <RegistrationMenu className={classes.createButtonHolder} />
          </div>
          <SubjectsTable subjects={props.subjects} type={props.subjectType} />
        </Paper>
      </Fragment>
    </div>
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
  )(CompleteVisit)
);
