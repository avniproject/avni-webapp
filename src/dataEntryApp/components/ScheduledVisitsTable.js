import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import moment from "moment";
import Colors from "../Colors";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  highlightBackground: {
    backgroundColor: Colors.HighlightBackgroundColor
  },
  tableContainer: {
    borderRadius: "3px",
    boxShadow: "0px 0px 1px"
  }
}));

const ScheduledVisitsTable = ({ visitSchedules }) => {
  const classes = useStyles();

  return (
    <Table
      className={`${classes.tableContainer} ${classes.highlightBackground}`}
      aria-label="caption table"
    >
      <TableHead>
        <TableRow>
          <TableCell align="left">Visit Name</TableCell>
          <TableCell align="left">Scheduling for</TableCell>
          <TableCell align="left">Overdue after</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {visitSchedules.map(row => (
          <TableRow key={row.name}>
            <TableCell align="left" component="th" scope="row">
              {row.name}
            </TableCell>
            <TableCell align="left">{moment(row.earliestDate).format("DD-MM-YYYY")}</TableCell>
            <TableCell align="left">{moment(row.maxDate).format("DD-MM-YYYY")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ScheduledVisitsTable;
