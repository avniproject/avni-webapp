import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { EnhancedTableHead } from "../../components/TableHeaderSorting";
import { TablePaginationActions } from "../../components/TablePagination";
import { useTranslation } from "react-i18next";

const useStyle = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(3),
    overflowX: "auto",
    flexShrink: 0,
    marginLeft: theme.spacing(2.5)
  },
  tableContainer: {
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
    backgroundColor: "#0e6eff",
    marginRight: 10
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

export const SubjectsTable = ({
  type,
  subjects,
  pageDetails,
  searchparam,
  rowsPerPage,
  setRowsPerPage,
  page,
  setPage
}) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("firstName");
  const [selected] = React.useState([]);
  let pageinfo = pageDetails.subjects;
  let searchText = searchparam;
  const camelize = str => {
    return (" " + str).toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr) {
      return chr.toUpperCase();
    });
  };
  let subjectsListObj = [];
  // let sortfields = orderBy + "," + order;
  let sortfields;

  if (subjects) {
    subjectsListObj = subjects.map(a => {
      let firstName = a.firstName ? camelize(a.firstName) : "";
      let lastName = a.lastName ? camelize(a.lastName) : "";
      let sub = {
        uuid: a.uuid,
        fullName: firstName + " " + lastName,
        subjectType: a.subjectType.name,
        gender: a.gender ? t(a.gender.name) : "",
        dateOfBirth: a.dateOfBirth
          ? new Date().getFullYear() - new Date(a.dateOfBirth).getFullYear() + " " + `${t("years")}`
          : "",
        addressLevel: a.addressLevel ? a.addressLevel.titleLineage : "",
        activePrograms: a.activePrograms ? a.activePrograms : []
      };
      return sub;
    });
  }
  const tableHeaderNames = [
    { id: "firstName", numeric: false, disablePadding: true, label: "Name", align: "left" },
    {
      id: "subjectType",
      numeric: false,
      disablePadding: true,
      label: "subjectType",
      align: "left"
    },
    { id: "gender", numeric: false, disablePadding: true, label: "gender", align: "left" },
    {
      id: "dateOfBirth",
      numeric: true,
      disablePadding: false,
      label: "age",
      align: "left"
    },
    {
      id: "addressLevel",
      numeric: false,
      disablePadding: true,
      label: "addressVillage",
      align: "left"
    },
    {
      id: "activePrograms",
      numeric: false,
      disablePadding: true,
      label: "enrolments",
      align: "left"
    }
  ];

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
    sortfields = property + "," + order;
    pageDetails.search({ page: 0, query: searchText, size: rowsPerPage, sort: sortfields });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    pageDetails.search({ page: newPage, query: searchText, size: rowsPerPage, sort: sortfields });
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    pageDetails.search({ page: 0, query: searchText, size: event.target.value, sort: sortfields });
  };

  return subjectsListObj ? (
    <div>
      <Table className={classes.tableContainer} aria-label="custom pagination table">
        <EnhancedTableHead
          headername={tableHeaderNames}
          classes={classes}
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
          rowCount={subjectsListObj.length}
        />
        <TableBody>
          {subjectsListObj.map(row => (
            <TableRow key={row.fullName}>
              <TableCell component="th" scope="row" padding="none" width="20%">
                <Link to={`/app/subject?uuid=${row.uuid}`}>{t(row.fullName)}</Link>
              </TableCell>
              <TableCell padding="none" width="12%">
                {row.subjectType}
              </TableCell>
              <TableCell align="left" className={classes.cellpadding}>
                {row.gender}
              </TableCell>
              <TableCell align="left" className={classes.cellpadding}>
                {row.dateOfBirth}
              </TableCell>
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
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              search={searchText}
              count={pageinfo.totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ) : (
    ""
  );
};
